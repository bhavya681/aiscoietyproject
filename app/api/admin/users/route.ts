import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ users }, "Users fetched.");
  } catch (error) {
    console.error("Admin users error:", error);

    return apiError("Internal server error.", 500);
  }
}
