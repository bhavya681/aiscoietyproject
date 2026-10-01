import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isValidObjectId(user.userId)) {
      return apiError("User not found.", 404);
    }

    await connectDB();

    const history = await Maintenance.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ history }, "Maintenance history fetched.");
  } catch (error) {
    console.error("Maintenance history error:", error);

    return apiError("Internal server error.", 500);
  }
}
