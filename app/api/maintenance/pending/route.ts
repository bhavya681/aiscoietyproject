import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getSocietyContext } from "@/app/lib/society";
import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

export async function GET(request: NextRequest) {
  try {
    const result = await getSocietyContext(request);

    // A resident who has not joined a society yet simply has nothing due.
    if (!result.ok) {
      if (result.status === 409) {
        return apiSuccess(
          {
            totalPending: 0,
            monthlyAmount: 0,
            nextDueDate: null,
            maintenance: [],
          },
          "No active society.",
          200
        );
      }

      return apiError(result.message, result.status);
    }

    const { context } = result;

    await connectDB();

    const maintenance = await Maintenance.find({
      userId: context.auth.userId,
      societyId: context.societyId,
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
      "Pending maintenance fetched.",
      200
    );
  } catch (error) {
    console.error("Pending maintenance error:", error);

    return apiError("Internal server error.", 500);
  }
}