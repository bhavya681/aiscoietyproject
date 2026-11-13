import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";

import { apiError } from "@/app/lib/apiResponse";
import {
  getAuthenticatedUser,
  isValidObjectId,
  type AuthUser,
} from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Membership, { type MembershipRole } from "@/app/models/Membership";
import Society from "@/app/models/Society";
import User from "@/app/models/User";
import type { SocietySummary } from "@/app/lib/types";

/**
 * Society helpers shared by every route that works inside a society.
 *
 * Authorization model
 * -----------------
 * A user's global `role` is not enough any more: a resident can belong to many
 * societies, and their permissions differ per society. Every society-scoped
 * handler therefore resolves a `SocietyContext` (active society + membership)
 * and checks the *membership* role.
 */

const INVITE_CODE_BYTES = 4;

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "society";
}

export function generateInviteCode(): string {
  return randomBytes(INVITE_CODE_BYTES).toString("hex").toUpperCase();
}

export async function uniqueSocietySlug(name: string): Promise<string> {
  const base = slugify(name);

  let candidate = base;
  let suffix = 1;

  while (await Society.exists({ slug: candidate })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

export async function uniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateInviteCode();

    if (!(await Society.exists({ inviteCode: code }))) {
      return code;
    }
  }

  throw new Error("Could not allocate a unique invite code.");
}

export function canManageSociety(role: MembershipRole): boolean {
  return role === "owner" || role === "admin";
}

export type SocietyContext = {
  auth: AuthUser;
  account: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  society: {
    _id: string;
    name: string;
    slug: string;
    inviteCode: string;
    address: string;
    monthlyMaintenance: number;
  };
  membership: {
    _id: string;
    role: MembershipRole;
    flat: string;
  };
  societyId: string;
  membershipRole: MembershipRole;
};

export type SocietyContextResult =
  | { ok: true; context: SocietyContext }
  | { ok: false; status: number; message: string };

type AccountRow = {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  activeSocietyId?: unknown;
};

type SocietyRow = {
  _id: unknown;
  name: string;
  slug: string;
  inviteCode: string;
  address?: string;
  monthlyMaintenance?: number;
};

type MembershipRow = {
  _id: unknown;
  role: MembershipRole;
  flat?: string;
};

/**
 * Resolves the signed-in user's active society and their role in it.
 *
 * Returns a typed failure instead of throwing so callers can map it to the
 * right HTTP status (401 unauthenticated, 409 no society, 404 stale pointer).
 */
export async function getSocietyContext(
  request: NextRequest
): Promise<SocietyContextResult> {
  const auth = getAuthenticatedUser(request);

  if (!auth) {
    return { ok: false, status: 401, message: "Authentication required." };
  }

  if (!isValidObjectId(auth.userId)) {
    return { ok: false, status: 404, message: "Account not found." };
  }

  await connectDB();

  const account = (await User.findById(auth.userId)
    .select("_id name email role activeSocietyId")
    .lean()) as unknown as AccountRow | null;

  if (!account) {
    return { ok: false, status: 404, message: "Account not found." };
  }

  const activeId =
    typeof account.activeSocietyId === "string"
      ? account.activeSocietyId
      : account.activeSocietyId
        ? String(account.activeSocietyId)
        : null;

  if (!activeId || !isValidObjectId(activeId)) {
    return {
      ok: false,
      status: 409,
      message: "Create or join a society before using this feature.",
    };
  }

  const [society, membership] = await Promise.all([
    Society.findById(activeId)
      .select("_id name slug inviteCode address monthlyMaintenance")
      .lean() as unknown as Promise<SocietyRow | null>,
    Membership.findOne({ userId: auth.userId, societyId: activeId })
      .select("_id role flat")
      .lean() as unknown as Promise<MembershipRow | null>,
  ]);

  if (!society || !membership) {
    return {
      ok: false,
      status: 404,
      message: "The active society could not be found.",
    };
  }

  return {
    ok: true,
    context: {
      auth,
      account: {
        _id: String(account._id),
        name: account.name,
        email: account.email,
        role: account.role,
      },
      society: {
        _id: String(society._id),
        name: society.name,
        slug: society.slug,
        inviteCode: society.inviteCode,
        address: society.address ?? "",
        monthlyMaintenance: society.monthlyMaintenance ?? 0,
      },
      membership: {
        _id: String(membership._id),
        role: membership.role,
        flat: membership.flat ?? "",
      },
      societyId: String(society._id),
      membershipRole: membership.role,
    },
  };
}

/**
 * Society-scoped admin gate.
 *
 * Owners and admins of the *active* society may manage it. A platform admin who
 * is only a resident in this society is rejected, which is the point.
 */
export async function requireSocietyAdmin(request: NextRequest): Promise<
  | { ok: true; context: SocietyContext }
  | { ok: false; response: ReturnType<typeof apiError> }
> {
  const result = await getSocietyContext(request);

  if (!result.ok) {
    return {
      ok: false,
      response: apiError(result.message, result.status),
    };
  }

  if (!canManageSociety(result.context.membershipRole)) {
    return {
      ok: false,
      response: apiError("Society admin access required.", 403),
    };
  }

  return result;
}

type PopulatedMembership = {
  _id: unknown;
  role: MembershipRole;
  flat?: string;
  societyId:
    | { _id: unknown; name: string; slug: string }
    | null;
};

/**
 * Every society a user belongs to, with their role in each.
 *
 * Used by the profile endpoint so the client can render a society switcher
 * without a second round trip.
 */
export async function getSocietySummaries(
  userId: string
): Promise<SocietySummary[]> {
  const memberships = (await Membership.find({ userId })
    .populate("societyId", "name slug")
    .lean()) as unknown as PopulatedMembership[];

  return memberships.flatMap((membership) => {
    const society = membership.societyId;

    if (!society) {
      return [];
    }

    return [
      {
        _id: String(society._id),
        name: society.name,
        slug: society.slug,
        role: membership.role,
        flat: membership.flat ?? "",
      },
    ];
  });
}