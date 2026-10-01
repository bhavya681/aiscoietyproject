import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import {
  getAuthenticatedUser,
  isValidObjectId,
  type AuthRole,
} from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

const ROLES: AuthRole[] = ["admin", "resident"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return apiError("Invalid user id.", 400);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { role } = body as Record<string, unknown>;

    if (typeof role !== "string" || !ROLES.includes(role as AuthRole)) {
      return apiError(`Invalid role. Allowed values: ${ROLES.join(", ")}.`, 400);
    }

    if (id === user.userId) {
      // Stops an admin from accidentally removing their own admin access.
      return apiError("You cannot change your own role.", 400);
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(id, { role }, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!updated) {
      return apiError("User not found.", 404);
    }

    return apiSuccess({ user: updated }, "User role updated successfully.",200);
  } catch (error) {
    console.error("Update role error:", error);

    return apiError("Internal server error.", 500);
  }
}
