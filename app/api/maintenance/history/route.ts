import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getSocietyContext } from "@/app/lib/society";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

export async function GET(request: NextRequest) {
  try {
    const result = await getSocietyContext(request);

    if (!result.ok) {
      if (result.status === 409) {
        return apiSuccess({ history: [] }, "No active society.", 200);
      }

      return apiError(result.message, result.status);
    }

    const { context } = result;

    await connectDB();

    const history = await Maintenance.find({
      userId: context.auth.userId,
      societyId: context.societyId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ history }, "Maintenance history fetched.", 200);
  } catch (error) {
    console.error("Maintenance history error:", error);

    return apiError("Internal server error.", 500);
  }
}