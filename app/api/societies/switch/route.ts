import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Membership from "@/app/models/Membership";
import User from "@/app/models/User";

/** Switches the signed-in user's active society. */
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

    const { societyId } = body as Record<string, unknown>;

    if (typeof societyId !== "string" || !isValidObjectId(societyId)) {
      return apiError("A valid society id is required.", 400);
    }

    // Membership is the authorization: you can only activate a society you
    // actually belong to.
    const membership = await Membership.findOne({
      userId: user.userId,
      societyId,
    })
      .select("_id role")
      .lean();

    if (!membership) {
      return apiError("You are not a member of that society.", 403);
    }

    await User.findByIdAndUpdate(user.userId, { activeSocietyId: societyId });

    return apiSuccess({ societyId }, "Active society updated.", 200);
  } catch (error) {
    console.error("Switch society error:", error);

    return apiError("Internal server error.", 500);
  }
}