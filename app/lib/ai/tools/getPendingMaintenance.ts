import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

export const getPendingMaintenanceTool = tool(
  async ({ userId }) => {
    await connectDB();

    const maintenance = await Maintenance.find({
      user: userId,
      status: "pending",
    }).sort({
      dueDate: 1,
    });

    if (maintenance.length === 0) {
      return {
        success: true,
        userId,
        pendingAmount: 0,
        records: [],
        message: "No pending maintenance found.",
      };
    }

    const pendingAmount = maintenance.reduce(
      (total, record) => total + record.amount,
      0
    );

    return {
      success: true,
      userId,
      pendingAmount,
      records: maintenance.map((record) => ({
        id: record._id.toString(),
        amount: record.amount,
        dueDate: record.dueDate,
        status: record.status,
      })),
    };
  },
  {
    name: "get_pending_maintenance",

    description:
      "Get the current user's pending society maintenance records and total pending amount.",

    schema: z.object({
      userId: z
        .string()
        .describe("The authenticated user's MongoDB user ID"),
    }),
  }
);