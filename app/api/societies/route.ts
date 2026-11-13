import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import {
  getSocietySummaries,
  uniqueInviteCode,
  uniqueSocietySlug,
} from "@/app/lib/society";
import Membership from "@/app/models/Membership";
import Society from "@/app/models/Society";
import User from "@/app/models/User";

const MAX_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 240;

/** Lists every society the signed-in user belongs to. */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isValidObjectId(user.userId)) {
      return apiError("Account not found.", 404);
    }

    await connectDB();

    const account = await User.findById(user.userId)
      .select("activeSocietyId")
      .lean();

    if (!account) {
      return apiError("Account not found.", 404);
    }

    const societies = await getSocietySummaries(user.userId);

    return apiSuccess(
      {
        societies,
        activeSocietyId: account.activeSocietyId
          ? String(account.activeSocietyId)
          : null,
      },
      "Societies fetched.",
      200
    );
  } catch (error) {
    console.error("List societies error:", error);

    return apiError("Internal server error.", 500);
  }
}

/**
 * Creates a society and makes the caller its owner.
 *
 * The first society a brand-new account creates becomes its active society.
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isValidObjectId(user.userId)) {
      return apiError("Account not found.", 404);
    }

    await connectDB();

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { name, address } = body as Record<string, unknown>;

    if (typeof name !== "string" || !name.trim()) {
      return apiError("A society name is required.", 400);
    }

    if (name.trim().length > MAX_NAME_LENGTH) {
      return apiError(
        `Society name must be at most ${MAX_NAME_LENGTH} characters.`,
        400
      );
    }

    if (
      typeof address === "string" &&
      address.trim().length > MAX_ADDRESS_LENGTH
    ) {
      return apiError(
        `Address must be at most ${MAX_ADDRESS_LENGTH} characters.`,
        400
      );
    }

    const trimmedName = name.trim();
    const slug = await uniqueSocietySlug(trimmedName);
    const inviteCode = await uniqueInviteCode();

    const society = await Society.create({
      name: trimmedName,
      slug,
      inviteCode,
      address: typeof address === "string" ? address.trim() : "",
      createdBy: user.userId,
    });

    await Membership.create({
      userId: user.userId,
      societyId: society._id,
      role: "owner",
      status: "active",
    });

    await User.findByIdAndUpdate(user.userId, {
      activeSocietyId: society._id,
    });

    return apiSuccess(
      {
        society: {
          _id: society._id.toString(),
          name: society.name,
          slug: society.slug,
          inviteCode: society.inviteCode,
          role: "owner",
        },
      },
      "Society created.",
      201
    );
  } catch (error) {
    console.error("Create society error:", error);

    return apiError("Internal server error.", 500);
  }
}