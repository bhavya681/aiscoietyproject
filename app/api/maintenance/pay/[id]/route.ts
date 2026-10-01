import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/app/lib/apiResponse";
import { getAuthenticatedUser, isValidObjectId } from "@/app/lib/auth";
import {
  isPaymentMethod,
  PAYMENT_METHODS,
  recordMaintenancePayment,
} from "@/app/lib/maintenanceService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return apiError("Invalid maintenance id.", 400);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { paymentMethod, confirmation } = body as Record<string, unknown>;

    // Application-level confirmation gate. Paying money is a destructive
    // action, so the request must explicitly acknowledge it. The AI assistant
    // has to satisfy this same gate before it can reach a payment.
    if (confirmation !== true) {
      return apiError(
        "Payment was not confirmed. Please confirm before paying.",
        400
      );
    }

    if (!isPaymentMethod(paymentMethod)) {
      return apiError(
        `Invalid payment method. Allowed values: ${PAYMENT_METHODS.join(", ")}.`,
        400
      );
    }

    const result = await recordMaintenancePayment({
      maintenanceId: id,
      requesterId: user.userId,
      requesterRole: user.role,
      paymentMethod,
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess(
      {
        amount: result.amount,
        transactionId: result.transactionId,
      },
      `Payment of ₹${result.amount.toLocaleString("en-IN")} recorded successfully.`
    );
  } catch (error) {
    console.error("Payment error:", error);

    return apiError("Internal server error.", 500);
  }
}
