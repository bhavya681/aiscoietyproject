"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import type { ChatResponse, ChatToolCall } from "@/app/lib/types";
import { formatCurrency } from "@/app/lib/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Tools the assistant used to produce this reply, if any. */
  toolCalls?: ChatToolCall[];
  /** Set while the assistant waits for the resident to confirm a payment. */
  confirmation?: ChatResponse["confirmation"];
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your SocietyAI assistant. I can look up your maintenance, " +
    "invoices and payment history, and answer questions about society policy.",
};

const SUGGESTIONS = [
  "How much maintenance do I have pending?",
  "Show my maintenance history.",
  "What is the monthly maintenance?",
  "What happens if I pay late?",
];

let messageCounter = 0;

function nextId(): string {
  messageCounter += 1;

  return `m${Date.now()}-${messageCounter}`;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const node = scrollRef.current;

    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string, confirmationId?: string) => {
      const question = text.trim();

      if (!question || loading) {
        return;
      }

      const userMessage: Message = {
        id: nextId(),
        role: "user",
        content: question,
      };

      // History sent to the server excludes the message we are adding now.
      const history = messages
        .filter((message) => message.id !== "welcome")
        .map(({ role, content }) => ({ role, content }));

      setMessages((previous) => [...previous, userMessage]);
      setInput("");
      setError("");
      setLoading(true);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            message: question,
            history,
            ...(confirmationId ? { confirmActionId: confirmationId } : {}),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "The assistant is unavailable right now."
          );
        }

        const result = data as ChatResponse;

        setMessages((previous) => [
          ...previous,
          {
            id: nextId(),
            role: "assistant",
            content: result.message,
            toolCalls: result.toolCalls,
            confirmation: result.confirmation,
          },
        ]);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Something went wrong while contacting the assistant."
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sendMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts a newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage(input);
    }
  }

  function confirmPayment(message: Message) {
    if (!message.confirmation) {
      return;
    }

    // The explicit confirmation id is what the server requires before it will
    // release the payment. The text is only the message shown in the chat.
    sendMessage("Yes, pay it", message.confirmation.id);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            AI
          </div>

          <div>
            <h2 className="font-semibold text-zinc-900">SocietyAI Assistant</h2>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">
                {loading ? "Thinking..." : "Online · RAG + tools"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-zinc-50 p-5">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "rounded-br-md bg-zinc-900 text-white"
                    : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800"
                }`}
              >
                {message.content}
              </div>
            </div>

            {message.toolCalls && message.toolCalls.length > 0 && (
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex flex-wrap gap-1.5">
                  {message.toolCalls.map((toolCall) => (
                    <span
                      key={`${message.id}-${toolCall.name}`}
                      title={`Tool status: ${toolCall.status}`}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        toolCall.status === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {toolCall.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {message.confirmation && (
              <div className="flex justify-start">
                <div className="w-full max-w-[85%] rounded-2xl rounded-bl-md border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Confirm payment
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    This will record a payment of{" "}
                    <strong>
                      {formatCurrency(message.confirmation.amount)}
                    </strong>{" "}
                    against your maintenance. Nothing has been charged yet.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => confirmPayment(message)}
                      disabled={loading}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                      Yes, pay it
                    </button>

                    <button
                      type="button"
                      onClick={() => setInput("cancel the payment")}
                      disabled={loading}
                      className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-white">
        <div className="flex gap-2 overflow-x-auto px-5 pt-4">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              disabled={loading}
              className="whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 p-5 pt-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about maintenance, invoices or society policy..."
            disabled={loading}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-zinc-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
