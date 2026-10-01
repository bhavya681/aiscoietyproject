import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Authenticated password change.
 *
 * This project has no outbound email service, so instead of a token-based
 * "forgot password" flow the signed-in resident must prove they know the
 * current password before a new one is accepted. That keeps the endpoint
 * simple and removes any need to store or email reset tokens.
 */
export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isValidObjectId(user.userId)) {
      return apiError("User not found.", 404);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { currentPassword, newPassword } = body as Record<string, unknown>;

    if (typeof currentPassword !== "string" || !currentPassword) {
      return apiError("Current password is required.", 400);
    }

    if (typeof newPassword !== "string" || !newPassword) {
      return apiError("New password is required.", 400);
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return apiError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        400
      );
    }

    await connectDB();

    const account = await User.findById(user.userId);

    if (!account) {
      return apiError("User not found.", 404);
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      account.password
    );

    if (!passwordMatches) {
      return apiError("Current password is incorrect.", 401);
    }

    account.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await account.save();

    return apiSuccess({}, "Password updated successfully.",200);
  } catch (error) {
    console.error("Reset password error:", error);

    return apiError("Internal server error.", 500);
  }
}
