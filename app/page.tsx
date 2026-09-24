"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              S
            </div>

            <span className="text-lg font-bold tracking-tight">
              SocietyAI
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-slate-600 transition hover:text-slate-950"
            >
              Features
            </Link>

            <Link
              href="#ai"
              className="text-sm text-slate-600 transition hover:text-slate-950"
            >
              AI Assistant
            </Link>

            <Link
              href="#how"
              className="text-sm text-slate-600 transition hover:text-slate-950"
            >
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_35%),radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_30%)]" />

        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              AI-powered society management
            </div>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Manage your society.
              <span className="block text-indigo-600">
                Let AI handle the questions.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              SocietyAI combines maintenance management, resident data,
              payments, invoices and an AI assistant into one simple platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Create Account →
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
              <span>✓ Maintenance tracking</span>
              <span>✓ AI assistant</span>
              <span>✓ Secure authentication</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Society Dashboard
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Good morning, Bhavya
                  </h3>
                </div>

                <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Account Active
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <PreviewCard
                  label="Pending"
                  value="₹4,000"
                  icon="₹"
                />

                <PreviewCard
                  label="Paid"
                  value="₹12,000"
                  icon="✓"
                />

                <PreviewCard
                  label="Due"
                  value="10 Sep"
                  icon="!"
                />
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    AI
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      SocietyAI Assistant
                    </p>
                    <p className="text-xs text-slate-500">
                      Ask about payments, invoices or maintenance.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  "How much maintenance do I have pending?"
                </div>

                <div className="mt-3 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                  You have ₹4,000 in pending maintenance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Platform
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Everything residents need.
            </h2>

            <p className="mt-4 text-slate-600">
              A single dashboard for everyday society management.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              title="Maintenance"
              description="Track pending and completed maintenance payments."
              icon="₹"
            />

            <Feature
              title="Invoices"
              description="View and access maintenance invoices from one place."
              icon="▣"
            />

            <Feature
              title="History"
              description="Keep a complete history of maintenance activity."
              icon="↗"
            />

            <Feature
              title="AI Assistant"
              description="Ask questions using your society's knowledge and data."
              icon="✦"
            />
          </div>
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-300">
              RAG + Tool Calling
            </div>

            <h2 className="text-4xl font-bold tracking-tight">
              Your society has an AI assistant.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              SocietyAI uses retrieval-augmented generation for society
              knowledge and tools for real-time user-specific operations.
            </p>

            <Link
              href="/ai"
              className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Try AI Assistant →
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="space-y-4">
              <ChatMessage
                role="You"
                message="How much maintenance do I have pending?"
              />

              <ChatMessage
                role="SocietyAI"
                message="You currently have ₹4,000 in pending maintenance."
                ai
              />

              <ChatMessage
                role="You"
                message="How can I pay it?"
              />

              <ChatMessage
                role="SocietyAI"
                message="You can pay through the available payment methods in your maintenance section."
                ai
              />
            </div>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Simple for residents. Powerful underneath.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              title="Sign in"
              description="Residents securely access their society account."
            />

            <Step
              number="02"
              title="Manage"
              description="View maintenance, payments, invoices and history."
            />

            <Step
              number="03"
              title="Ask AI"
              description="Use natural language to get answers and perform supported actions."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SocietyAI</p>

          <p>AI-powered society management platform</p>
        </div>
      </footer>
    </main>
  );
}

function PreviewCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>

        <span className="text-xs font-bold text-indigo-600">{icon}</span>
      </div>

      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ChatMessage({
  role,
  message,
  ai = false,
}: {
  role: string;
  message: string;
  ai?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        ai
          ? "ml-8 border border-indigo-400/20 bg-indigo-500/10"
          : "mr-8 bg-white/5"
      }`}
    >
      <p className="text-xs font-semibold text-slate-400">{role}</p>

      <p className="mt-1 text-sm leading-6 text-slate-200">{message}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}