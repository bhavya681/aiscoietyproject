import { isValidObjectId, getAuthenticatedUser } from "@/app/lib/auth";
import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Identity always comes from the verified JWT, never from the client.
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isValidObjectId(user.userId)) {
      return apiError("User not found.", 404);
    }

    await connectDB();

    const profile = await User.findById(user.userId)
      .select("-password")
      .lean();

    if (!profile) {
      // Token is valid but the account was deleted.
      return apiError("User not found.", 404);
    }

    return apiSuccess({ profile }, "Profile fetched.",200);
  } catch (error) {
    console.error("Profile error:", error);

    return apiError("Internal server error.", 500);
  }
}
