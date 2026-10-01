import type { NextResponse } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import type { AuthUser } from "@/app/lib/auth";
import { recordMaintenancePayment } from "@/app/lib/maintenanceService";

import {
  consumePendingAction,
  findPendingActionForUser,
  getPendingAction,
  type PendingAction,
} from "./pendingActions";

/**
 * Application-level payment confirmation.
 *
 * This runs BEFORE the model is involved, on purpose:
 *
 *   "Pay my maintenance."   -> the model may only call `request_payment`
 *   "Yes, pay it"          -> this handler executes the payment
 *
 * Because the execution path is here and not behind a tool, no prompt, tool
 * call or model output can trigger a payment without a matching, unexpired
 * pending action that belongs to the authenticated user.
 */

/**
 * Only short, unambiguous affirmatives count as consent.
 *
 * A long message ("yes, but first show me my invoice") deliberately does NOT
 * match, because a payment confirmation should be a deliberate one-liner. The
 * UI's confirm button sends `confirmActionId` and bypasses this text check.
 */
const EXPLICIT_CONFIRMATION = [
  /^(yes|yeah|yep|yup|sure|ok|okay|confirm|proceed|go ahead|do it)[\s.!]*$/i,
  /^(yes|yeah|yep|yup|sure|ok|okay|please|pls)[\s,!.]+(go ahead|proceed|pay it|pay|do it|confirm it|confirm)[\s.!]*$/i,
  /^(pay it|pay|charge me|make the payment)[\s.!]*$/i,
];

export function isExplicitConfirmation(message: string): boolean {
  const normalized = message.trim();

  if (!normalized || normalized.length > 60) {
    return false;
  }

  return EXPLICIT_CONFIRMATION.some((pattern) => pattern.test(normalized));
}

export type ConfirmationOutcome =
  /** The message was not a confirmation; continue to the model. */
  | { handled: false }
  /** A confirmation was given and processed; stop here. */
  | { handled: true; response: NextResponse };

type Resolution =
  | { kind: "none" }
  | { kind: "invalid" }
  | { kind: "action"; action: PendingAction };

/**
 * Resolves `confirmActionId` (from the UI button) or a natural-language
 * "yes" into a pending action owned by `user`.
 */
function resolvePendingAction(
  user: AuthUser,
  message: string,
  confirmActionId: string | undefined
): Resolution {
  if (confirmActionId) {
    const action = getPendingAction(
      confirmActionId,
      user.userId,
      "pay_maintenance"
    );

    // An id was supplied but it is unknown, expired, already used, or belongs
    // to another user. Say so rather than quietly falling through to the model.
    return action ? { kind: "action", action } : { kind: "invalid" };
  }

  if (isExplicitConfirmation(message)) {
    const action = findPendingActionForUser(user.userId);

    return action ? { kind: "action", action } : { kind: "none" };
  }

  return { kind: "none" };
}

export async function handlePaymentConfirmation(options: {
  user: AuthUser;
  message: string;
  confirmActionId?: string;
}): Promise<ConfirmationOutcome> {
  const { user, message, confirmActionId } = options;

  const resolution = resolvePendingAction(user, message, confirmActionId);

  if (resolution.kind === "none") {
    return { handled: false };
  }

  if (resolution.kind === "invalid") {
    return {
      handled: true,
      response: apiError(
        "That payment confirmation is invalid or has already expired. " +
          "Please ask the assistant to pay again.",
        400
      ),
    };
  }

  const { action } = resolution;

  // Single use: whether the payment succeeds or fails, the confirmation is
  // spent so a stale confirmation cannot be replayed.
  consumePendingAction(action.id);

  const result = await recordMaintenancePayment({
    maintenanceId: action.maintenanceId,
    requesterId: user.userId,
    requesterRole: user.role,
    paymentMethod: action.paymentMethod,
  });

  if (!result.ok) {
    return {
      handled: true,
      response: apiError(result.message, result.status),
    };
  }

  return {
    handled: true,
    response: apiSuccess(
      {
        payment: {
          transactionId: result.transactionId,
          amount: result.amount,
          method: action.paymentMethod,
        },
        source: "confirmation",
        toolCalls: [
          { name: "record_maintenance_payment", status: "success" as const },
        ],
      },
      `Payment confirmed. ?${result.amount.toLocaleString(
        "en-IN"
      )} was paid via ${action.paymentMethod.replace("_", " ")} ` +
        `(transaction ${result.transactionId}). Your maintenance for that cycle is now marked paid.`
    ),
  };
}