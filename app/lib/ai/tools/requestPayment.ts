import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import Maintenance from "@/app/models/Maintenance";

import { createPendingPayment } from "../pendingActions";
import { getToolUser } from "../toolContext";

/**
 * Financial action, step 1 of 2: PROPOSE a payment.
 *
 * This tool deliberately does not move money. It records a short-lived pending
 * action and asks the resident to confirm. Only the application-level
 * confirmation handler is allowed to call `recordMaintenancePayment`.
 *
 * Because this is the only payment-related tool the model can see, a model
 * that gets confused — or a prompt that tries to talk it into paying — still
 * cannot spend the resident's money.
 */
export const requestPaymentTool = tool(
  async ({ maintenanceId, paymentMethod }, config) => {
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
        success: false as const,
        error: "NOTHING_TO_PAY",
        message: "There is no unpaid maintenance to pay.",
      };
    }

    if (maintenance.pendingAmount <= 0) {
      return {
        success: false as const,
        error: "NOTHING_TO_PAY",
        message: "There is no unpaid maintenance to pay.",
      };
    }

    const action = createPendingPayment({
      userId: user.userId,
      maintenanceId: maintenance._id.toString(),
      amount: maintenance.pendingAmount,
      // Default to UPI when the resident has not stated a preference; the
      // resident can still cancel or choose another method on the UI.
      paymentMethod: paymentMethod ?? "upi",
    });

    return {
      success: true as const,
      confirmationRequired: true as const,
      confirmationId: action.id,
      maintenanceId: action.maintenanceId,
      amount: action.amount,
      currency: "INR",
      suggestedMethod: paymentMethod,
      message:
        `You have ₹${action.amount.toLocaleString("en-IN")} pending for ` +
        `maintenance due ${maintenance.dueDate.toISOString().slice(0, 10)}. ` +
        "Ask the resident to confirm before this payment is executed.",
    };
  },
  {
    name: "request_payment",
    description:
      "Propose paying the signed-in resident's pending maintenance. This does " +
      "NOT execute the payment: it asks the resident for explicit confirmation " +
      "first. Use it when the resident asks to pay maintenance. Never tell the " +
      "resident the payment is done — only that you are waiting for confirmation.",
    schema: z.object({
      maintenanceId: z
        .string()
        .optional()
        .describe(
          "Optional maintenance record id. Omit to propose the next unpaid one."
        ),
      paymentMethod: z
        .enum(["upi", "bank_transfer", "cash", "other"])
        .optional()
        .describe(
          "Preferred payment method if the resident already mentioned one."
        ),
    }),
  }
);
