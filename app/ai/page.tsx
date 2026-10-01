"use client";

import AppShell from "../components/layout/AppShell";
import ChatBox from "../components/ai/ChatBox";

export default function AIPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm text-zinc-500">Assistant</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            SocietyAI
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Policy questions are answered from the society knowledge base, and
            account questions are answered from your real maintenance data.
          </p>
        </div>

        <ChatBox />
      </div>
    </AppShell>
  );
}
