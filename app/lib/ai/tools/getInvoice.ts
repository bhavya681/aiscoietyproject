import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import Invoice from "@/app/models/Invoice";
import Maintenance from "@/app/models/Maintenance";

import { getToolUser } from "../toolContext";

/**
 * Read-only tool: invoice / bill details for the signed-in resident.
 *
 * With no argument it returns the next unpaid record. With a maintenance id it
 * returns that specific record. Ownership is always enforced against the
 * authenticated user, so an id belonging to another resident is a 404.
 */
export const getInvoiceTool = tool(
  async ({ maintenanceId }, config) => {
    const user = getToolUser(config);

    if (!user) {
      return {
        success: false as const,
        error: "UNAUTHORIZED",
        message: "No authenticated user was supplied to this tool.",
      };
    }

    await connectDB();

    const filter: Record<string, unknown> = { userId: user.userId };

    if (maintenanceId) {
      filter._id = maintenanceId;
    } else {
      filter.status = { $in: ["pending", "overdue"] };
    }

    const maintenance = await Maintenance.findOne(filter)
      .sort({ dueDate: 1 })
      .lean();

    if (!maintenance) {
      return {
        success: true as const,
        found: false as const,
        message: maintenanceId
          ? "No invoice was found for that reference."
          : "You have no unpaid maintenance invoice.",
      };
    }

    // The formal invoice document is optional; fall back to the maintenance
    // record, which already carries the amount and due date.
    const invoice = await Invoice.findOne({
      maintenanceId: maintenance._id,
      userId: user.userId,
    }).lean();

    return {
      success: true as const,
      found: true as const,
      invoice: {
        maintenanceId: maintenance._id.toString(),
        invoiceNumber: invoice?.invoiceNumber ?? null,
        amount: invoice?.amount ?? maintenance.pendingAmount,
        issueDate:
          invoice?.issueDate?.toISOString() ??
          (maintenance.createdAt as Date | undefined)?.toISOString() ??
          null,
        dueDate:
          invoice?.dueDate?.toISOString() ??
          maintenance.dueDate.toISOString(),
        status: invoice?.status ?? maintenance.status,
      },
    };
  },
  {
    name: "get_invoice",
    description:
      "Get invoice or bill details for the signed-in resident: invoice number, " +
      "amount, issue date, due date and status. Call with no arguments for the " +
      "next unpaid invoice, or pass a maintenanceId for a specific one.",
    schema: z.object({
      maintenanceId: z
        .string()
        .optional()
        .describe(
          "Optional maintenance record id. Omit to get the next unpaid invoice."
        ),
    }),
  }
);
