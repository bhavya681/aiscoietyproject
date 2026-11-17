"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, RefreshCw, Send } from "lucide-react";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/api";
import { formatDate } from "@/app/lib/types";

type ChatMessage = {
  _id: string;
  text: string;
  sender: { _id: string; name: string; role: string };
  createdAt: string;
};

const POLL_INTERVAL_MS = 4000;

function roleVariant(role: string): "info" | "secondary" | "default" {
  if (role === "owner") return "info";
  if (role === "admin") return "secondary";
  return "default";
}

export default function SocietyChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<string | null>(null);

  async function loadInitial() {
    try {
      const data = await apiFetch<{ messages: ChatMessage[] }>(
        "/societies/chat/messages"
      );

      setMessages(data.messages);
      cursorRef.current =
        data.messages.length > 0
          ? data.messages[data.messages.length - 1].createdAt
          : null;
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load the chat."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await loadInitial();
      if (cancelled) return;
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(async () => {
      if (!cursorRef.current) return;

      try {
        const data = await apiFetch<{ messages: ChatMessage[] }>(
          `/societies/chat/messages?since=${encodeURIComponent(
            cursorRef.current
          )}`
        );

        if (data.messages.length > 0) {
          setMessages((previous) => {
            const seen = new Set(previous.map((message) => message._id));
            const fresh = data.messages.filter(
              (message) => !seen.has(message._id)
            );
            return fresh.length > 0 ? [...previous, ...fresh] : previous;
          });

          cursorRef.current =
            data.messages[data.messages.length - 1].createdAt;
        }
      } catch {
        // Polling failures are silent; the next tick will retry.
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();

    const text = input.trim();

    if (!text || sending) return;

    setSending(true);
    setError("");

    try {
      const data = await apiFetch<{ message: ChatMessage }>(
        "/societies/chat/messages",
        { method: "POST", body: { text } }
      );

      setMessages((previous) => [...previous, data.message]);
      cursorRef.current = data.message.createdAt;
      setInput("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not send the message."
      );
    } finally {
      setSending(false);
    }
  }

  const hasNoSociety = error.toLowerCase().includes("create or join a society");

  return (
    <AppShell>
      <div className="flex w-full flex-col space-y-4 lg:space-y-6">
        <PageHeader
          eyebrow="Society chat"
          title="Group chat"
          description="A private space for the members of your society. Messages are shared with everyone in the community."
          action={
            <Link
              href="/societies"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Your societies
            </Link>
          }
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {error}
              {hasNoSociety && (
                <>
                  {" "}
                  <Link href="/societies" className="font-medium underline">
                    Create or join a society
                  </Link>
                  .
                </>
              )}
            </span>
          </div>
        )}

        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium text-foreground">Messages</h2>
            </div>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
              {messages.length} messages
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-xl bg-muted/70"
                  />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  No messages yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Be the first to say hello to your society.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {messages.map((message) => {
                  const initials = message.sender.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <li key={message._id} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {message.sender.name}
                          </span>
                          <StatusBadge
                            variant={roleVariant(message.sender.role)}
                            size="sm"
                            className="capitalize"
                          >
                            {message.sender.role}
                          </StatusBadge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                          {message.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border/70 px-4 py-3 sm:px-5"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message…"
              maxLength={2000}
              disabled={sending}
              className="h-10 flex-1 rounded-[10px] border border-input bg-card px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {sending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}