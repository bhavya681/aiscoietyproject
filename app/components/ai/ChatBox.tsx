"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Copy,
  SquarePen,
} from "lucide-react";

import type { ChatResponse } from "@/app/lib/types";
import { formatCurrency } from "@/app/lib/types";
import OpenUIMessage from "./OpenUIMessage";
import RichText from "./RichText";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ui?: string | null;
  timestamp?: string;
  confirmation?: ChatResponse["confirmation"];
};

const SUGGESTIONS = [
  {
    title: "Pending dues",
    desc: "How much maintenance do I have pending?",
  },
  {
    title: "Payment history",
    desc: "Show my maintenance and payment history.",
  },
  {
    title: "Monthly rate",
    desc: "What is the monthly maintenance amount?",
  },
  {
    title: "Late payment rules",
    desc: "What happens if I pay late?",
  },
];

let messageCounter = 0;

function nextId(): string {
  messageCounter += 1;
  return `m${Date.now()}-${messageCounter}`;
}

function timeNow(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [nearBottom, setNearBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const node = scrollRef.current;

    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior });
    }
  }, []);

  useEffect(() => {
    if (nearBottom) {
      scrollToBottom();
    }
  }, [messages, loading, nearBottom, scrollToBottom]);

  useEffect(() => {
    const node = textareaRef.current;

    if (node) {
      node.style.height = "auto";
      node.style.height = `${Math.min(node.scrollHeight, 176)}px`;
    }
  }, [input]);

  function handleScroll() {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;

    setNearBottom(distance < 96);
  }

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    setInput("");
    setNearBottom(true);
    textareaRef.current?.focus();
  };

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
        timestamp: timeNow(),
      };

      const history = messages.map(({ role, content }) => ({ role, content }));

      setMessages((previous) => [...previous, userMessage]);
      setInput("");
      setError("");
      setLoading(true);
      setNearBottom(true);

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
            data?.message || "The assistant is currently unavailable."
          );
        }

        const result = data as ChatResponse;

        setMessages((previous) => [
          ...previous,
          {
            id: nextId(),
            role: "assistant",
            content: result.message,
            ui: result.ui,
            timestamp: timeNow(),
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
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  function confirmPayment(message: Message) {
    if (!message.confirmation) {
      return;
    }

    const confirmationId = message.confirmation.id;

    setMessages((previous) =>
      previous.map((item) =>
        item.id === message.id ? { ...item, confirmation: null } : item
      )
    );

    sendMessage("Yes, proceed and record payment", confirmationId);
  }

  function cancelPayment(message: Message) {
    setMessages((previous) =>
      previous.map((item) =>
        item.id === message.id ? { ...item, confirmation: null } : item
      )
    );

    sendMessage("No, cancel the payment.");
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-chat-glow" />

      <header className="relative z-10 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald text-[11px] font-semibold text-primary-foreground shadow-sm shadow-primary/20">
              SA
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  SocietyAI
                </h1>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald ring-1 ring-inset ring-emerald/20">
                  <span className="h-1 w-1 rounded-full bg-emerald" />
                  Online
                </span>
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                Grounded on your society records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            title="Start a new conversation"
          >
            <SquarePen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-10">
          {showWelcome ? (
            <section className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                SA
              </span>

              <p className="mt-6 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                Resident concierge
              </p>

              <h2 className="mt-3 max-w-2xl text-balance text-2xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-[32px]">
                How can I help with your society today?
              </h2>

              <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
                Ask about dues, payments, receipts or society rules. Answers are
                grounded in your account and the official society document.
              </p>

              <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => sendMessage(suggestion.desc)}
                    disabled={loading}
                    className="group rounded-2xl border border-border/70 bg-card/80 px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="block text-xs font-semibold text-foreground">
                        {suggestion.title}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                      {suggestion.desc}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div className="flex-1 space-y-6 sm:space-y-7">
              {messages.map((message) => {
                const isUser = message.role === "user";
                const hasUI = !isUser && Boolean(message.ui);

                if (isUser) {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-[75%]">
                        <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-6 text-primary-foreground">
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        {message.timestamp && (
                          <p className="mt-1 pr-1 text-right text-[10px] text-muted-foreground">
                            {message.timestamp}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className="flex gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-[9px] font-semibold text-primary">
                      SA
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="min-w-0 text-[15px] leading-7 text-foreground">
                        {hasUI ? (
                          <OpenUIMessage
                            source={message.ui || ""}
                            fallback={message.content}
                          />
                        ) : (
                          <RichText
                            text={message.content}
                            className="text-[15px] leading-7"
                          />
                        )}
                      </div>

                      {message.confirmation && (
                        <div className="mt-3 rounded-xl border border-amber/30 bg-amber/[0.06] p-4">
                          <p className="text-xs font-semibold text-foreground">
                            Payment approval required
                          </p>

                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            Confirming will record an official payment of{" "}
                            <strong className="font-semibold text-foreground">
                              {formatCurrency(message.confirmation.amount)}
                            </strong>{" "}
                            toward your outstanding dues.
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => confirmPayment(message)}
                              disabled={loading}
                              className="h-9 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Confirm &amp; record
                            </button>

                            <button
                              type="button"
                              onClick={() => cancelPayment(message)}
                              disabled={loading}
                              className="h-9 rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(message.id, message.content)
                          }
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors hover:bg-muted hover:text-foreground"
                          title="Copy response"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>

                        {message.timestamp && (
                          <span className="text-[10px]">
                            {message.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-[9px] font-semibold text-primary">
                    SA
                  </span>

                  <div className="flex items-center gap-1.5 pt-2.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!nearBottom && (
                <div className="sticky bottom-2 z-10 flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNearBottom(true);
                      scrollToBottom();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                    title="Scroll to latest message"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 shrink-0 border-t border-border/70 bg-background px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4 lg:px-10">
        <div className="w-full">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message SocietyAI…"
              disabled={loading}
              className="max-h-44 min-h-11 w-full flex-1 resize-none bg-transparent px-2.5 py-2.5 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              title="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-2 flex flex-col items-center justify-between gap-1 px-1 text-[10px] text-muted-foreground sm:flex-row">
            <span className="hidden sm:inline">
              Press Enter to send · Shift + Enter for a new line
            </span>
            <span className="text-center sm:text-right">
              SocietyAI can make mistakes. Verify important information.
            </span>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {loading ? "SocietyAI is thinking" : ""}
      </div>
    </div>
  );
}
