import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Membership from "@/app/models/Membership";
import Society from "@/app/models/Society";
import User from "@/app/models/User";

/**
 * Joins an existing society using its invite code.
 *
 * Joining is idempotent: an existing member simply switches their active
 * society instead of receiving an error.
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

    const { inviteCode } = body as Record<string, unknown>;

    if (typeof inviteCode !== "string" || !inviteCode.trim()) {
      return apiError("An invite code is required.", 400);
    }

    const normalizedCode = inviteCode.trim().toUpperCase();

    const society = await Society.findOne({ inviteCode: normalizedCode }).lean();

    if (!society) {
      return apiError("No society matches that invite code.", 404);
    }

    const existing = await Membership.findOne({
      userId: user.userId,
      societyId: society._id,
    });

    if (!existing) {
      await Membership.create({
        userId: user.userId,
        societyId: society._id,
        role: "resident",
        status: "active",
      });
    }

    await User.findByIdAndUpdate(user.userId, {
      activeSocietyId: society._id,
    });

    return apiSuccess(
      {
        society: {
          _id: String(society._id),
          name: society.name,
          slug: society.slug,
          role: existing ? existing.role : "resident",
        },
      },
      existing ? "Switched to that society." : "Joined the society.",
      200
    );
  } catch (error) {
    console.error("Join society error:", error);

    return apiError("Internal server error.", 500);
  }
}