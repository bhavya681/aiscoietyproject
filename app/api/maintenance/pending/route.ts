import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

export async function GET(request: NextRequest) {
  try {
    // The owner is taken from the JWT, so a resident can never query
    // somebody else's maintenance by passing a different id.
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isValidObjectId(user.userId)) {
      return apiError("User not found.", 404);
    }

    await connectDB();

    const maintenance = await Maintenance.find({
      userId: user.userId,
      status: { $in: ["pending", "overdue"] },
    })
      .sort({ dueDate: 1 })
      .lean();

    const totalPending = maintenance.reduce(
      (total, record) => total + record.pendingAmount,
      0
    );

    const nextDue = maintenance[0]?.dueDate ?? null;

    return apiSuccess(
      {
        totalPending,
        monthlyAmount: maintenance[0]?.monthlyAmount ?? 0,
        nextDueDate: nextDue,
        maintenance,
      },
      "Pending maintenance fetched."
    );
  } catch (error) {
    console.error("Pending maintenance error:", error);

    return apiError("Internal server error.", 500);
  }
}
