import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { requireSocietyAdmin } from "@/app/lib/society";
import Membership, { MEMBERSHIP_ROLES } from "@/app/models/Membership";
import User from "@/app/models/User";
import type { MembershipRole } from "@/app/lib/types";

type PopulatedMembership = {
  _id: unknown;
  role: MembershipRole;
  flat?: string;
  createdAt?: unknown;
  userId:
    | {
        _id: unknown;
        name: string;
        email: string;
        phone?: string;
        address?: string;
      }
    | null;
};

function toMember(membership: PopulatedMembership) {
  const account = membership.userId;

  return {
    _id: String(account?._id ?? membership.userId),
    name: account?.name ?? "Unknown resident",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
    address: account?.address ?? "",
    flat: membership.flat ?? "",
    role: membership.role,
    joinedAt:
      membership.createdAt instanceof Date
        ? membership.createdAt.toISOString()
        : typeof membership.createdAt === "string"
          ? membership.createdAt
          : undefined,
  };
}

/** Lists the members of the active society (admins only). */
export async function GET(request: NextRequest) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;

    const memberships = (await Membership.find({
      societyId: context.societyId,
    })
      .populate("userId", "name email phone address")
      .sort({ createdAt: 1 })
      .lean()) as unknown as PopulatedMembership[];

    return apiSuccess(
      {
        members: memberships.map(toMember),
        inviteCode: context.society.inviteCode,
      },
      "Members fetched.",
      200
    );
  } catch (error) {
    console.error("List members error:", error);

    return apiError("Internal server error.", 500);
  }
}

/**
 * Adds an existing account to the active society by email.
 *
 * There is no invite-email flow in this project, so membership is granted
 * directly. The account must already exist; ask the person to sign up first if
 * it does not.
 */
export async function POST(request: NextRequest) {
  try {
    const gate = await requireSocietyAdmin(request);

    if (!gate.ok) {
      return gate.response;
    }

    const { context } = gate;

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { email, role, flat } = body as Record<string, unknown>;

    if (typeof email !== "string" || !email.trim()) {
      return apiError("An email address is required.", 400);
    }

    if (
      role !== undefined &&
      (typeof role !== "string" ||
        !(MEMBERSHIP_ROLES as readonly string[]).includes(role))
    ) {
      return apiError(
        `Invalid role. Allowed values: ${MEMBERSHIP_ROLES.join(", ")}.`,
        400
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const account = await User.findOne({ email: normalizedEmail })
      .select("_id name email phone address")
      .lean();

    if (!account) {
      return apiError(
        "No account exists with that email. Ask them to create an account first.",
        404
      );
    }

    const existing = await Membership.findOne({
      userId: account._id,
      societyId: context.societyId,
    }).select("_id");

    if (existing) {
      return apiError("That person is already a member.", 409);
    }

    const membership = await Membership.create({
      userId: account._id,
      societyId: context.societyId,
      role:
        typeof role === "string" && role !== "owner"
          ? (role as MembershipRole)
          : "resident",
      status: "active",
      flat: typeof flat === "string" ? flat.trim() : "",
    });

    return apiSuccess(
      {
        member: {
          _id: String(account._id),
          name: account.name,
          email: account.email,
          phone: account.phone ?? "",
          address: account.address ?? "",
          flat: membership.flat,
          role: membership.role,
        },
      },
      "Member added.",
      201
    );
  } catch (error) {
    console.error("Add member error:", error);

    return apiError("Internal server error.", 500);
  }
}