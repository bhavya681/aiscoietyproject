import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import type { NextRequest } from "next/server";

type ProfileUpdate = {
  name?: string;
  phone?: string;
  address?: string;
};

/**
 * Applies a profile update to the authenticated user.
 * `role` and `email` are intentionally not updatable here.
 */
async function handleUpdate(request: NextRequest) {
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

    const { name, phone, address } = body as Record<string, unknown>;

    const update: ProfileUpdate = {};

    if (typeof name === "string" && name.trim()) {
      update.name = name.trim();
    }

    if (typeof phone === "string" && phone.trim()) {
      update.phone = phone.trim();
    }

    // The client may send a number (e.g. from an <input type="number">).
    if (typeof phone === "number" && Number.isFinite(phone)) {
      update.phone = String(phone);
    }

    if (typeof address === "string" && address.trim()) {
      update.address = address.trim();
    }

    if (Object.keys(update).length === 0) {
      return apiError("At least one valid field is required.", 400);
    }

    await connectDB();

    const profile = await User.findByIdAndUpdate(user.userId, update, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!profile) {
      return apiError("User not found.", 404);
    }

    return apiSuccess({ user: profile }, "Profile updated successfully.");
  } catch (error) {
    console.error("Update profile error:", error);

    return apiError("Internal server error.", 500);
  }
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

export async function PATCH(request: NextRequest) {
  return handleUpdate(request);
}
