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
  Bot,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  HelpCircle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SquarePen,
} from "lucide-react";

import type { ChatResponse, ChatToolCall } from "@/app/lib/types";
import { formatCurrency } from "@/app/lib/types";
import OpenUIMessage from "./OpenUIMessage";
import RichText from "./RichText";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ui?: string | null;
  timestamp?: string;
  toolCalls?: ChatToolCall[];
  confirmation?: ChatResponse["confirmation"];
};

const SUGGESTIONS = [
  {
    title: "Pending dues",
    desc: "How much maintenance do I have pending?",
    icon: CreditCard,
  },
  {
    title: "Payment history",
    desc: "Show my maintenance and payment history.",
    icon: FileText,
  },
  {
    title: "Monthly rate",
    desc: "What is the monthly maintenance amount?",
    icon: Building2,
  },
  {
    title: "Late payment rules",
    desc: "What happens if I pay late?",
    icon: HelpCircle,
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
      node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
    }
  }, [input]);

  function handleScroll() {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const distance =
      node.scrollHeight - node.scrollTop - node.clientHeight;

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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(31,107,82,0.08),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(121,201,166,0.12),transparent_68%)]"
      />

      <header className="relative z-10 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <Bot className="h-4 w-4" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  SocietyAI
                </h1>
                <span className="hidden items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary sm:inline-flex">
                  AI
                </span>
              </div>
              <p className="truncate text-[10px] text-muted-foreground">
                Your society assistant · OpenUI
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>

            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-accent"
              title="Start a new conversation"
            >
              <SquarePen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-3 py-5 sm:px-6 sm:py-7">
          {showWelcome ? (
            <section className="flex flex-1 flex-col items-center justify-center py-4 text-center sm:py-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                <Sparkles className="h-7 w-7" />
              </div>

              <h2 className="mt-5 max-w-xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                How can I help with your society today?
              </h2>

              <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                Ask about dues, payments, receipts or society rules. Answers are
                grounded in your account and the official society document.
              </p>

              <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2.5 text-left min-[420px]:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => {
                  const Icon = suggestion.icon;

                  return (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => sendMessage(suggestion.desc)}
                      disabled={loading}
                      className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-foreground">
                          {suggestion.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                          {suggestion.desc}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Connected to your society ledger
              </div>
            </section>
          ) : (
            <div className="flex-1 space-y-6 sm:space-y-8">
              {messages.map((message) => {
                const isUser = message.role === "user";
                const hasUI = !isUser && Boolean(message.ui);

                if (isUser) {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[86%] sm:max-w-[75%]">
                        <div className="rounded-3xl rounded-br-lg border border-border/50 bg-muted px-4 py-2.5 text-[15px] leading-6 text-foreground">
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        {message.timestamp && (
                          <p className="mt-1 pr-1 text-right font-mono text-[9px] text-muted-foreground">
                            {message.timestamp}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className="flex gap-3 sm:gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                      <Bot className="h-4 w-4" />
                    </div>

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

                      {message.toolCalls && message.toolCalls.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {message.toolCalls.map((toolCall) => (
                            <span
                              key={`${message.id}-${toolCall.name}`}
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium ${
                                toolCall.status === "success"
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {toolCall.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {message.confirmation && (
                        <div className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-3.5 sm:p-4">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <p className="font-mono text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                              Payment approval required
                            </p>
                          </div>

                          <p className="mt-2 text-xs leading-relaxed text-foreground">
                            Confirming will record an official payment of{" "}
                            <strong className="font-bold text-foreground">
                              {formatCurrency(message.confirmation.amount)}
                            </strong>{" "}
                            toward your outstanding dues.
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => confirmPayment(message)}
                              disabled={loading}
                              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Confirm &amp; record
                            </button>

                            <button
                              type="button"
                              onClick={() => cancelPayment(message)}
                              disabled={loading}
                              className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-1 text-muted-foreground">
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(message.id, message.content)
                          }
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors hover:bg-accent hover:text-foreground"
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
                          <span className="font-mono text-[9px]">
                            {message.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-2.5 pt-1.5">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking…
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-3.5 py-3 text-xs text-destructive">
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
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-lg transition-colors hover:text-foreground"
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

      <div className="relative z-10 shrink-0 border-t border-border/60 bg-background/85 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-6 sm:pt-4">
        <div className="mx-auto w-full max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 rounded-[1.4rem] border border-border/80 bg-card p-2 shadow-lg shadow-black/[0.05] transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 dark:shadow-black/20"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message SocietyAI…"
              disabled={loading}
              className="max-h-40 min-h-[40px] w-full resize-none bg-transparent px-2.5 py-2 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              title="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-2 flex flex-col items-center justify-between gap-1 px-1 text-[10px] text-muted-foreground sm:flex-row">
            <span className="hidden items-center gap-1 sm:inline-flex">
              <span className="rounded border border-border/80 px-1 font-mono text-[9px]">
                Enter
              </span>
              to send · Shift + Enter for a new line
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
