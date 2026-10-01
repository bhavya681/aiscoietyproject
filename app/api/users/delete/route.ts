import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import {
  getAuthenticatedUser,
  isValidObjectId,
  TOKEN_COOKIE,
} from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Invoice from "@/app/models/Invoice";
import Maintenance from "@/app/models/Maintenance";
import Payment from "@/app/models/Payment";
import User from "@/app/models/User";

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isValidObjectId(user.userId)) {
      return apiError("User not found.", 404);
    }

    await connectDB();

    const deletedUser = await User.findByIdAndDelete(user.userId);

    if (!deletedUser) {
      return apiError("User not found.", 404);
    }

    // Remove the account's dependent records so no orphans are left behind.
    await Promise.all([
      Maintenance.deleteMany({ userId: user.userId }),
      Payment.deleteMany({ userId: user.userId }),
      Invoice.deleteMany({ userId: user.userId }),
    ]);

    const response = apiSuccess({}, "Account deleted successfully.",200);

    response.cookies.set(TOKEN_COOKIE, "", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);

    return apiError("Internal server error.", 500);
  }
}
