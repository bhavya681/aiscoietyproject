import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Invoice from "@/app/models/Invoice";
import Maintenance from "@/app/models/Maintenance";
import Payment from "@/app/models/Payment";
import User from "@/app/models/User";

export async function DELETE(
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

    if (id === user.userId) {
      return apiError("Admin cannot delete their own account here.", 400);
    }

    await connectDB();

    const deleted = await User.findByIdAndDelete(id).select("_id").lean();

    if (!deleted) {
      return apiError("User not found.", 404);
    }

    await Promise.all([
      Maintenance.deleteMany({ userId: id }),
      Payment.deleteMany({ userId: id }),
      Invoice.deleteMany({ userId: id }),
    ]);

    return apiSuccess({}, "User deleted successfully.");
  } catch (error) {
    console.error("Admin delete user error:", error);

    return apiError("Internal server error.", 500);
  }
}
