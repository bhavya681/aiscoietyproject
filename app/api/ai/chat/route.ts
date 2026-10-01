import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/app/lib/apiResponse";
import { getAuthenticatedUser } from "@/app/lib/auth";
import {
  askMaintenanceAssistant,
  type ChatMessage,
} from "@/app/lib/ai/maintenanceAssistant";
import { handlePaymentConfirmation } from "@/app/lib/ai/paymentConfirmation";

const MAX_MESSAGE_LENGTH = 1_000;
const MAX_HISTORY_MESSAGES = 20;

/** Detects Gemini/provider quota errors so we can return a helpful 429. */
function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { status, message, name } = error as {
    status?: number;
    message?: string;
    name?: string;
  };

  if (status === 429) {
    return true;
  }

  return (
    typeof message === "string" &&
    (message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      name === "RateLimitQuotaExhaustedError")
  );
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { role, content } = value as Record<string, unknown>;

  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    // The acting user comes from the verified JWT, never from the body.
    const user = getAuthenticatedUser(request);

    if (!user) {
      return apiError("Authentication required.", 401);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return apiError("Invalid request body.", 400);
    }

    const { message, history, confirmActionId } = body as Record<string, unknown>;

    if (typeof message !== "string" || !message.trim()) {
      return apiError("A message is required.", 400);
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return apiError("Message is too long.", 400);
    }

    const question = message.trim();

    /*
     * ------------------------------------------------------------------
     * STEP 1 — Application-level payment confirmation.
     *
     * This happens before the model is consulted. The assistant can only
     * *propose* a payment (request_payment); executing it is this handler's
     * job, and only for a pending action owned by this user.
     * ------------------------------------------------------------------
     */
    const confirmation = await handlePaymentConfirmation({
      user,
      message: question,
      confirmActionId:
        typeof confirmActionId === "string" && confirmActionId
          ? confirmActionId
          : undefined,
    });

    if (confirmation.handled) {
      return confirmation.response;
    }

    /*
     * ------------------------------------------------------------------
     * STEP 2 — RAG + tool-calling loop.
     * ------------------------------------------------------------------
     */
    const result = await askMaintenanceAssistant({
      question,
      user,
      history: Array.isArray(history)
        ? history.filter(isChatMessage).slice(-MAX_HISTORY_MESSAGES)
        : [],
    });

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        toolCalls: result.toolCalls,
        source: result.source,
        // Non-null only when the assistant is waiting for the resident to
        // confirm a payment. The client renders a confirm button for it.
        confirmation: result.confirmation,
      },
      { status: 200 }
    );
  } catch (error) {
    // Never leak stack traces or provider internals to the client.
    console.error("AI chat error:", error);

    // The Gemini free tier is rate limited per model. Tell the client to retry
    // rather than reporting an opaque server error.
    if (isRateLimitError(error)) {
      return apiError(
        "The assistant is receiving too many requests right now. Please wait a moment and try again.",
        429
      );
    }

    return apiError(
      "The AI assistant is temporarily unavailable. Please try again.",
      503
    );
  }
}
