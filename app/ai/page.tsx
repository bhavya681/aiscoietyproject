"use client";

import AppShell from "../components/layout/AppShell";
import ChatBox from "../components/ai/ChatBox";

export default function AIPage() {
  return (
    <AppShell>
      <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-6.5rem)] max-w-5xl mx-auto flex flex-col">
        <ChatBox />
      </div>
    </AppShell>
  );
}


