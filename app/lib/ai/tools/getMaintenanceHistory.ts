import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

import { getToolUser } from "../toolContext";

const DEFAULT_LIMIT = 10;

/**
 * Read-only tool: the signed-in resident's maintenance history, newest first.
 */
export const getMaintenanceHistoryTool = tool(
  async ({ limit }, config) => {
    const user = getToolUser(config);

    if (!user) {
      return {
        success: false as const,
        error: "UNAUTHORIZED",
        message: "No authenticated user was supplied to this tool.",
      };
    }

    await connectDB();

    const history = await Maintenance.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(limit ?? DEFAULT_LIMIT)
      .lean();

    return {
      success: true as const,
      count: history.length,
      records: history.map((record) => ({
        maintenanceId: record._id.toString(),
        monthlyAmount: record.monthlyAmount,
        amountPaid:
          record.status === "paid" ? record.monthlyAmount : record.pendingAmount,
        status: record.status,
        dueDate: record.dueDate.toISOString(),
        paidAt: record.paidAt ? record.paidAt.toISOString() : null,
        paymentMethod: record.paymentMethod ?? null,
      })),
    };
  },
  {
    name: "get_maintenance_history",
    description:
      "Get the signed-in resident's maintenance history (paid, pending and " +
      "overdue records) with dates, amounts and status. Use this for " +
      "'show my maintenance history' or 'when did I last pay'.",
    schema: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Maximum number of records to return. Defaults to 10."),
    }),
  }
);
