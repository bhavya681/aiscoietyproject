import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

import { getToolUser } from "../toolContext";

/**
 * Read-only tool: total and per-record outstanding maintenance for the
 * signed-in resident.
 *
 * There is no `userId` parameter on purpose. The LLM cannot ask for somebody
 * else's data, because the schema does not allow it — the acting user is read
 * from the application-supplied runnable config instead.
 */
export const getPendingMaintenanceTool = tool(
  async (_input, config) => {
    const user = getToolUser(config);

    if (!user) {
      return {
        success: false as const,
        error: "UNAUTHORIZED",
        message: "No authenticated user was supplied to this tool.",
      };
    }

    await connectDB();

    const records = await Maintenance.find({
      userId: user.userId,
      status: { $in: ["pending", "overdue"] },
    })
      .sort({ dueDate: 1 })
      .lean();

    const totalPending = records.reduce(
      (total, record) => total + record.pendingAmount,
      0
    );

    return {
      success: true as const,
      totalPending,
      currency: "INR",
      monthlyAmount: records[0]?.monthlyAmount ?? 0,
      records: records.map((record) => ({
        maintenanceId: record._id.toString(),
        amountDue: record.pendingAmount,
        dueDate: record.dueDate.toISOString(),
        status: record.status,
      })),
    };
  },
  {
    name: "get_pending_maintenance",
    description:
      "Get the signed-in resident's outstanding maintenance: total amount due, " +
      "monthly amount, and each unpaid record with its due date. Use this for " +
      "questions such as 'how much maintenance do I have pending'.",
    schema: z.object({}),
  }
);
