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
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  Building,
  CreditCard,
  HelpCircle,
  FileText,
  CornerDownLeft,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

import type { ChatResponse, ChatToolCall } from "@/app/lib/types";
import { formatCurrency } from "@/app/lib/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  toolCalls?: ChatToolCall[];
  confirmation?: ChatResponse["confirmation"];
};

const SUGGESTIONS = [
  {
    title: "Pending Maintenance",
    desc: "How much maintenance do I have pending?",
    icon: CreditCard,
  },
  {
    title: "Payment History",
    desc: "Show my maintenance and payment history.",
    icon: FileText,
  },
  {
    title: "Monthly Rate",
    desc: "What is the monthly maintenance amount?",
    icon: Building,
  },
  {
    title: "Late Payment Rules",
    desc: "What happens if I pay late?",
    icon: HelpCircle,
  },
];

let messageCounter = 0;

function nextId(): string {
  messageCounter += 1;
  return `m${Date.now()}-${messageCounter}`;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your **SocietyAI Concierge**.\n\nI can verify your maintenance dues, look up historical transactions, generate receipts, and clarify any questions regarding our society bylaws.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Auto-resize textarea with controlled bounds
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: nextId(),
        role: "assistant",
        content:
          "Chat cleared. How can I assist you with your society affairs today?",
        timestamp: "Just now",
      },
    ]);
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
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

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
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
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
    sendMessage("Yes, proceed and record payment", message.confirmation.id);
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl transition-all">
      
      {/* Header Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card/90 px-4 sm:px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#315CF5] text-white shadow-sm shadow-[#315CF5]/20">
            <Bot className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                SocietyAI Concierge
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#315CF5]/20 bg-[#315CF5]/10 px-2 py-0.5 text-[10px] font-semibold text-[#315CF5]">
                <Sparkles className="h-2.5 w-2.5" />
                RAG Engine
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
              Real-time ledger access &amp; society bylaws
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearChat}
            title="Reset conversation"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area — dynamic viewport height with zero horizontal overflow */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-4 sm:p-6"
      >
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex gap-3 sm:gap-3.5 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? "bg-[#315CF5] text-white shadow-xs"
                    : "border border-border/80 bg-muted text-foreground"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content Container */}
              <div
                className={`flex flex-col space-y-1.5 max-w-[88%] sm:max-w-[78%] ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`group relative rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed break-words overflow-hidden ${
                    isUser
                      ? "rounded-tr-xs bg-[#315CF5] text-white font-normal shadow-sm"
                      : "rounded-tl-xs border border-border/80 bg-muted/20 text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(message.id, message.content)}
                      className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 text-muted-foreground"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Tool Badges */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {message.toolCalls.map((toolCall) => (
                      <span
                        key={`${message.id}-${toolCall.name}`}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold ${
                          toolCall.status === "success"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Tool: {toolCall.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Payment Confirmation Card */}
                {message.confirmation && (
                  <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <ShieldAlert className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider font-mono">
                        Payment Approval Required
                      </p>
                    </div>

                    <p className="mt-1.5 text-xs leading-relaxed text-foreground">
                      Authorizing this will register an official payment of{" "}
                      <strong className="text-foreground font-bold">
                        {formatCurrency(message.confirmation.amount)}
                      </strong>{" "}
                      toward your outstanding dues.
                    </p>

                    <div className="mt-3.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => confirmPayment(message)}
                        disabled={loading}
                        className="rounded-xl bg-[#315CF5] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#2549d4] disabled:opacity-50"
                      >
                        Confirm &amp; Record
                      </button>

                      <button
                        type="button"
                        onClick={() => setInput("cancel payment")}
                        disabled={loading}
                        className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {message.timestamp && (
                  <span className="text-[10px] text-muted-foreground font-mono px-1">
                    {message.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-muted text-foreground">
              <Bot className="h-4 w-4" />
            </div>

            <div className="rounded-2xl rounded-tl-xs border border-border/80 bg-muted/20 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#315CF5]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#315CF5] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#315CF5] [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Suggested Prompts Cards */}
      {messages.length <= 2 && (
        <div className="shrink-0 border-t border-border/60 bg-muted/10 px-3 py-2.5 sm:px-6">
          <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Suggested Prompts
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {SUGGESTIONS.map((sugg) => {
              const Icon = sugg.icon;
              return (
                <button
                  key={sugg.title}
                  type="button"
                  onClick={() => sendMessage(sugg.desc)}
                  disabled={loading}
                  className="flex items-start gap-2 rounded-xl border border-border/80 bg-card p-2 text-left transition hover:border-[#315CF5]/40 hover:bg-[#315CF5]/5 group"
                >
                  <div className="rounded-lg bg-[#315CF5]/10 p-1 text-[#315CF5] shrink-0 mt-0.5">
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">
                      {sugg.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                      {sugg.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Composer Bar */}
      <div className="shrink-0 border-t border-border/80 bg-card p-3 sm:p-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-2xl border border-border/80 bg-muted/20 transition-all focus-within:border-[#315CF5] focus-within:ring-2 focus-within:ring-[#315CF5]/20"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about dues, receipts, rules... (Press Enter to send)"
            disabled={loading}
            className="max-h-28 min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          <div className="flex items-center gap-1.5 pr-2">
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#315CF5] text-white shadow-sm transition hover:bg-[#2549d4] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </form>

        <p className="mt-1.5 text-center text-[10px] font-mono text-muted-foreground">
          SocietyAI provides grounded answers from registered ledger &amp; bylaws.
        </p>
      </div>
    </div>
  );
}
