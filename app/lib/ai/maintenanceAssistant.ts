import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
  type MessageContent,
} from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";

import type { AuthUser } from "@/app/lib/auth";

import { retrieveSocietyKnowledge } from "./rag";
import { withAuthUser } from "./toolContext";
import { ASSISTANT_TOOLS, getToolByName } from "./tools";

/**
 * The society maintenance assistant.
 *
 * Request flow:
 *
 *   question
 *     -> RAG retrieves policy chunks from society.txt
 *     -> system prompt = instructions + retrieved policy text
 *     -> model decides: answer directly, or request a tool
 *     -> the APPLICATION executes the tool (the model never does)
 *     -> tool result goes back to the model as a ToolMessage
 *     -> model produces the final answer
 */

/** Hard stop so a confused model cannot loop forever. */
const MAX_TOOL_ITERATIONS = 5;

/**
 * Default chat model.
 *
 * `gemini-flash-latest` is Google's stable alias for the current Flash model,
 * so it keeps working when older pinned names (e.g. gemini-1.5-flash,
 * gemini-2.5-flash) are retired. Override it with GOOGLE_CHAT_MODEL if you
 * want to pin a specific version.
 */
const DEFAULT_CHAT_MODEL = "gemini-flash-latest";

const NO_KNOWLEDGE_MESSAGE =
  "The information is not available in the society knowledge base.";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ToolCallSummary = {
  name: string;
  status: "success" | "error" | "unauthorized" | "unknown";
};

export type ConfirmationRequest = {
  /** Opaque id the client echoes back to confirm the payment. */
  id: string;
  amount: number;
  maintenanceId: string;
};

export type AssistantResult = {
  message: string;
  toolCalls: ToolCallSummary[];
  /** Where the answer's data came from. */
  source: "rag" | "tool" | "both" | "none";
  /** Set when the assistant is waiting for the resident to confirm a payment. */
  confirmation: ConfirmationRequest | null;
};

/**
 * Builds the chat model with the assistant's tools bound to it.
 */
function createModel() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not defined");
  }

  return new ChatGoogleGenerativeAI({
    model: process.env.GOOGLE_CHAT_MODEL || DEFAULT_CHAT_MODEL,
    temperature: 0.2,
    apiKey,
  }).bindTools([...ASSISTANT_TOOLS]);
}

type AssistantModel = ReturnType<typeof createModel>;

let modelInstance: AssistantModel | null = null;

/**
 * The model is created once and reused.
 *
 * It is created lazily (on first use) rather than at import time, so a missing
 * GOOGLE_API_KEY produces a clear 500 at request time instead of breaking the
 * whole build.
 */
function getModel(): AssistantModel {
  if (!modelInstance) {
    modelInstance = createModel();
  }

  return modelInstance;
}

/**
 * Flattens a LangChain message content value into plain text.
 * Gemini responses may be a plain string or an array of content blocks.
 */
export function toText(content: MessageContent | undefined): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((block) => {
      if (typeof block === "string") {
        return block;
      }

      if (block && typeof block === "object" && "text" in block) {
        const { text } = block as { text?: unknown };

        return typeof text === "string" ? text : "";
      }

      return "";
    })
    .join("")
    .trim();
}

const SYSTEM_PROMPT = `You are SocietyAI, the maintenance assistant for a residential society.

You answer in two very different ways, and you must keep them separate.

1. SOCIETY POLICY QUESTIONS (fees, due dates, rules, timings, facilities)
   Answer only from the "SOCIETY KNOWLEDGE" section provided below.
   That text is retrieved from the society's official document and is the only
   source of truth for policy. Never guess, extrapolate or use outside
   knowledge. If the knowledge does not contain the answer, reply exactly:
   "${NO_KNOWLEDGE_MESSAGE}"
   If the question is not about this society at all (for example the weather),
   say you can only help with society maintenance, policies and the resident's
   own account.

2. THE RESIDENT'S OWN ACCOUNT (their maintenance, invoices, payment history)
   Use the tools. The tools already run as the signed-in resident, so you
   cannot and should not ask for or accept a user id.
   State the real numbers returned by the tool. Do not invent amounts, dates or
   payment statuses, and never describe a record as paid unless the tool says so.

PAYMENTS ARE SAFE BY DESIGN:
   - You have no tool that transfers money.
   - When a resident asks to pay, call request_payment. That tool only records
     a pending confirmation and does NOT pay anything.
   - After calling it, tell the resident the exact amount and ask them to
     confirm. Never claim the payment already succeeded.
   - If request_payment says there is nothing to pay, say so.

Be concise and friendly. Use plain text. Format currency as ₹4,000.

SOCIETY KNOWLEDGE
-----------------
{knowledge}
-----------------`;

function buildKnowledgeBlock(chunks: { content: string }[]): string {
  if (chunks.length === 0) {
    return "(nothing relevant was retrieved for this question)";
  }

  return chunks.map((chunk) => chunk.content).join("\n\n");
}

function toBaseMessages(
  history: ChatMessage[],
  question: string
): BaseMessage[] {
  return [
    ...history.map((message) =>
      message.role === "user"
        ? new HumanMessage(message.content)
        : new AIMessage(message.content)
    ),
    new HumanMessage(question),
  ];
}

type ExecutedToolCall = {
  summary: ToolCallSummary;
  toolMessage: ToolMessage;
  confirmation: ConfirmationRequest | null;
};

/**
 * Executes one tool call on behalf of the model.
 *
 * This is the important part of the architecture: the model only *asks* for a
 * tool. This application validates the tool name, invokes the tool with the
 * authenticated identity from the runnable config, and turns the result into
 * the ToolMessage the model needs to continue.
 */
async function executeToolCall(
  toolCall: { name: string; args?: Record<string, unknown>; id?: string },
  config: RunnableConfig
): Promise<ExecutedToolCall> {
  const toolCallId = toolCall.id ?? "unknown";

  const fail = (
    summary: ToolCallSummary,
    payload: Record<string, unknown>
  ): ExecutedToolCall => ({
    summary,
    confirmation: null,
    toolMessage: new ToolMessage({
      content: JSON.stringify(payload),
      tool_call_id: toolCallId,
    }),
  });

  const tool = getToolByName(toolCall.name);

  if (!tool) {
    // Invalid tool call: tell the model rather than crashing the request.
    console.warn(`Assistant requested unknown tool "${toolCall.name}"`);

    return fail(
      { name: toolCall.name, status: "unknown" },
      {
        success: false,
        error: "UNKNOWN_TOOL",
        message: `No tool named "${toolCall.name}" is available.`,
      }
    );
  }

  try {
    const result: unknown = await tool.invoke(toolCall.args ?? {}, config);

    const record = (result ?? {}) as {
      success?: boolean;
      error?: string;
      confirmationId?: string;
      amount?: number;
      maintenanceId?: string;
    };

    const confirmation: ConfirmationRequest | null =
      typeof record.confirmationId === "string"
        ? {
            id: record.confirmationId,
            amount: record.amount ?? 0,
            maintenanceId: record.maintenanceId ?? "",
          }
        : null;

    const status: ToolCallSummary["status"] =
      record.error === "UNAUTHORIZED"
        ? "unauthorized"
        : record.success === false
          ? "error"
          : "success";

    return {
      summary: { name: toolCall.name, status },
      confirmation,
      toolMessage: new ToolMessage({
        content: JSON.stringify(result),
        tool_call_id: toolCallId,
      }),
    };
  } catch (error) {
    console.error(`Tool "${toolCall.name}" failed:`, error);

    // Tool errors are reported to the model so it can apologise rather than
    // invent an answer, and the request still returns a usable response.
    return fail(
      { name: toolCall.name, status: "error" },
      {
        success: false,
        error: "TOOL_ERROR",
        message:
          "The tool could not be executed. Tell the user it is temporarily " +
          "unavailable instead of guessing.",
      }
    );
  }
}

/**
 * Runs the full agentic loop for a single question.
 */
export async function askMaintenanceAssistant(options: {
  question: string;
  user: AuthUser;
  history?: ChatMessage[];
}): Promise<AssistantResult> {
  const { question, user, history = [] } = options;

  const model = getModel();

  // --- RAG: retrieve the policy chunks relevant to this question ----------
  const knowledge = await retrieveSocietyKnowledge(question);

  const messages: BaseMessage[] = [
    new SystemMessage(
      SYSTEM_PROMPT.replace("{knowledge}", buildKnowledgeBlock(knowledge))
    ),
    ...toBaseMessages(history, question),
  ];

  // The authenticated identity every tool invocation inherits.
  const toolConfig = withAuthUser(user);

  const toolCalls: ToolCallSummary[] = [];
  let confirmation: ConfirmationRequest | null = null;
  let usedTool = false;
  let answer = "";

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    const response = await model.invoke(messages);

    if (!response.tool_calls?.length) {
      answer = toText(response.content);
      break;
    }

    usedTool = true;

    // 1. Keep the model's own message: it carries the requested tool calls.
    messages.push(response);

    // 2. The application executes every requested tool and answers each one
    //    with a ToolMessage, in the same order the model asked for them.
    for (const toolCall of response.tool_calls) {
      const executed = await executeToolCall(toolCall, toolConfig);

      toolCalls.push(executed.summary);
      messages.push(executed.toolMessage);

      if (executed.confirmation) {
        confirmation = executed.confirmation;
      }
    }
  }

  if (!answer) {
    answer = toolCalls.length
      ? "I could not complete that request. Please try rephrasing your question."
      : NO_KNOWLEDGE_MESSAGE;
  }

  const hasKnowledge = knowledge.length > 0;

  const source: AssistantResult["source"] = usedTool
    ? hasKnowledge
      ? "both"
      : "tool"
    : hasKnowledge
      ? "rag"
      : "none";

  return { message: answer, toolCalls, source, confirmation };
}
