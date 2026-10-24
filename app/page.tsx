"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/app/lib/theme";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import {
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Receipt,
  CreditCard,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  Clock,
  MessageSquare,
  BadgeCheck,
  Check
} from "lucide-react";

export default function Home() {
  const { resolved } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [activeAiDemo, setActiveAiDemo] = useState(0);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const aiConversations = [
    {
      q: "How much maintenance do I have pending for flat B-402?",
      a: "Your outstanding maintenance balance is ₹4,000 for October 2026. Due date is October 10. Water charges (₹1,200) and Club facilities (₹800) are included.",
      tag: "Maintenance & Dues",
      intent: "ledger_lookup"
    },
    {
      q: "Can I download my payment invoice from last month?",
      a: "Yes! Invoice #INV-2026-09-402 for ₹4,000 (Paid on Sept 4, 2026 via UPI) is ready. You can download the PDF receipt directly.",
      tag: "Digital Receipts",
      intent: "invoice_retrieval"
    },
    {
      q: "What are the clubhouse gym hours on Sunday?",
      a: "According to Green Heights Society Bylaws: The gym is open from 6:00 AM – 12:00 PM and 4:00 PM – 9:30 PM on Sundays. Maintenance sanitization is scheduled 12:00 PM – 4:00 PM.",
      tag: "Society Knowledge (RAG)",
      intent: "rag_bylaws"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#090A0D] text-[#101114] dark:text-[#F8FAFC] selection:bg-[#315CF5] selection:text-white transition-colors duration-300">
      
      {/* ========================================================
          1. NAVIGATION (Legency Media style: minimal, tactile, clean)
         ======================================================== */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F7F8FA]/85 dark:bg-[#090A0D]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
          
          {/* Brand Logo & Editorial Wordmark */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#14151B] border border-black/[0.08] dark:border-white/[0.1] shadow-sm transition-transform duration-200 group-hover:scale-105">
              <img
                src={resolved === "dark" ? "/logo.png" : "/logo-light.png"}
                alt="SocietyAI Logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight-editorial font-sans leading-none flex items-center gap-1.5">
                Society<span className="text-[#315CF5]">AI</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-normal uppercase bg-black/[0.05] dark:bg-white/[0.08] text-muted-foreground">
                  v2.4
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground tracking-wide font-mono mt-0.5 hidden sm:block">
                RESIDENTIAL OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-9 md:flex">
            <Link
              href="#platform"
              className="text-sm font-medium text-[#626773] dark:text-[#94A3B8] transition-colors hover:text-[#101114] dark:hover:text-white"
            >
              Platform
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-[#626773] dark:text-[#94A3B8] transition-colors hover:text-[#101114] dark:hover:text-white"
            >
              Capabilities
            </Link>
            <Link
              href="#ai"
              className="text-sm font-medium text-[#626773] dark:text-[#94A3B8] transition-colors hover:text-[#101114] dark:hover:text-white flex items-center gap-1.5"
            >
              <span>AI Assistant</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#315CF5] animate-pulse" />
            </Link>
            <Link
              href="#workflow"
              className="text-sm font-medium text-[#626773] dark:text-[#94A3B8] transition-colors hover:text-[#101114] dark:hover:text-white"
            >
              Workflow
            </Link>
          </nav>

          {/* Right Action Stack: Theme Switcher + Login + Bubble CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-[#626773] dark:text-[#94A3B8] hover:text-[#101114] dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="bubble-cta bubble-cta-blue"
            >
              <span>Get Started</span>
              <span className="bubble-cta-arrow">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] text-foreground md:hidden hover:bg-black/5 dark:hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-black/[0.08] dark:border-white/[0.1] bg-[#F7F8FA] dark:bg-[#090A0D] px-6 py-6 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground py-2 border-b border-border/40"
              >
                Platform
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground py-2 border-b border-border/40"
              >
                Capabilities
              </Link>
              <Link
                href="#ai"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground py-2 border-b border-border/40"
              >
                AI Assistant
              </Link>
              <Link
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground py-2 border-b border-border/40"
              >
                Workflow
              </Link>
              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-medium"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION — OVERSIDED EDITORIAL COMPOSITION
         ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 bg-dither-pattern">
        
        {/* Editorial Sub-bar & Metadata badge */}
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-[#315CF5] animate-ping" />
              <span className="text-xs uppercase tracking-widest font-mono text-[#626773] dark:text-[#94A3B8]">
                Next-Gen Residential Intelligence
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-xs font-mono text-[#626773] dark:text-[#94A3B8]">
              <span>RAG RETRIEVAL 2.0</span>
              <span>•</span>
              <span>INSTANT RECONCILIATION</span>
              <span>•</span>
              <span>RESIDENT OS</span>
            </div>
          </div>

          {/* Hero Headline — Bold, Editorial, Confident */}
          <div className="mt-12 sm:mt-16 max-w-5xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[84px] font-semibold tracking-tighter-editorial leading-[0.98] text-[#101114] dark:text-[#F8FAFC]">
              Society management. <br />
              <span className="text-[#315CF5] inline-block mt-1 sm:mt-2">
                Reimagined with AI.
              </span>
            </h1>
          </div>

          {/* Two-Column Pitch & Action Bar */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-black/[0.08] dark:border-white/[0.08] pb-12">
            <div className="lg:col-span-7">
              <p className="text-lg sm:text-xl md:text-2xl font-normal leading-relaxed text-[#626773] dark:text-[#94A3B8] max-w-2xl">
                Manage maintenance, track payments, access invoices, and get instant answers with an AI assistant built for modern residential communities.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-wrap items-center gap-4 sm:justify-end">
              <Link
                href="/signup"
                className="bubble-cta bubble-cta-blue text-base py-2.5 px-6"
              >
                <span>Get Started Now</span>
                <span className="bubble-cta-arrow">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="#platform"
                className="bubble-cta bubble-cta-ghost text-base py-2.5 px-5"
              >
                <span>Explore Features</span>
                <span className="bubble-cta-arrow">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* Proof / Metric Pillars — Legency Media inspired */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101114] dark:text-white">
                100%
              </span>
              <span className="text-xs sm:text-sm text-[#626773] dark:text-[#94A3B8] font-normal mt-1">
                Automated invoice dispatch
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101114] dark:text-white">
                &lt; 2s
              </span>
              <span className="text-xs sm:text-sm text-[#626773] dark:text-[#94A3B8] font-normal mt-1">
                AI response query latency
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101114] dark:text-white">
                ₹0 Leakage
              </span>
              <span className="text-xs sm:text-sm text-[#626773] dark:text-[#94A3B8] font-normal mt-1">
                Audited ledger reconciliation
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101114] dark:text-white">
                24/7
              </span>
              <span className="text-xs sm:text-sm text-[#626773] dark:text-[#94A3B8] font-normal mt-1">
                Bylaws &amp; dues assistant
              </span>
            </div>
          </div>

          {/* Hero Visual: Realistic Studio Product Interface Showcase */}
          <div className="mt-12 sm:mt-16">
            <div className="relative rounded-2xl sm:rounded-3xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#111217] p-3 sm:p-5 shadow-2xl shadow-black/10 dark:shadow-black/60">
              
              {/* Studio Browser Header */}
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground hidden sm:inline-block">
                    app.societyai.io/dashboard/society-overview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live System Active
                  </span>
                </div>
              </div>

              {/* Product Showcase Inner Layout */}
              <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 Columns: Real resident dashboard UI */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  
                  {/* Resident Header Card */}
                  <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F7F8FA]/60 dark:bg-[#181920]/60 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono uppercase text-[#315CF5] font-semibold">
                            RESIDENCE B-402
                          </span>
                          <span className="text-xs text-muted-foreground">• Palm Grove Residency</span>
                        </div>
                        <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                          Welcome back, Resident
                        </h3>
                      </div>
                      <Link
                        href="/maintenance"
                        className="rounded-lg bg-[#315CF5] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#2549d4] transition"
                      >
                        Pay Maintenance
                      </Link>
                    </div>

                    {/* Metrics Grid */}
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#121319] p-3.5">
                        <span className="text-xs text-muted-foreground font-medium">Pending Dues</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">₹4,000</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Due Oct 10, 2026</span>
                      </div>

                      <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#121319] p-3.5">
                        <span className="text-xs text-muted-foreground font-medium">Last Payment</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹4,000</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">✓ Sept Verified</span>
                      </div>

                      <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#121319] p-3.5">
                        <span className="text-xs text-muted-foreground font-medium">Invoices Issued</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-bold text-foreground">12</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">FY 2026-27</span>
                      </div>
                    </div>
                  </div>

                  {/* Transactions / Invoices Table snippet */}
                  <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121319] p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                        Recent Billing &amp; Receipts
                      </span>
                      <Link href="/maintenance" className="text-xs text-[#315CF5] font-medium hover:underline">
                        View All
                      </Link>
                    </div>
                    <div className="mt-3 divide-y divide-border/40 text-xs sm:text-sm">
                      <div className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            INV
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Maintenance Fee — Oct 2026</p>
                            <p className="text-xs text-muted-foreground font-mono">INV-2026-10-402 • Regular</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-600 dark:text-amber-400">₹4,000</p>
                          <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">Pending</span>
                        </div>
                      </div>

                      <div className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-[#315CF5] flex items-center justify-center font-bold text-xs">
                            RCP
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Maintenance Fee — Sep 2026</p>
                            <p className="text-xs text-muted-foreground font-mono">RCP-2026-09-881 • HDFC UPI</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹4,000</p>
                          <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Settled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: AI Copilot Assistant Widget Showcase */}
                <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F7F8FA]/80 dark:bg-[#16171E] p-4 sm:p-5">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#315CF5] text-white">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">SocietyAI Concierge</p>
                          <p className="text-[10px] font-mono text-muted-foreground">RAG Vector Store Connected</p>
                        </div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>

                    {/* Chat Bubble Showcase */}
                    <div className="mt-4 space-y-3">
                      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#315CF5] px-3.5 py-2.5 text-xs text-white shadow-sm">
                        How much maintenance do I have pending?
                      </div>

                      <div className="mr-auto max-w-[90%] rounded-2xl rounded-tl-sm border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121319] p-3 text-xs shadow-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#315CF5] mb-1">
                          <Sparkles className="h-3 w-3" />
                          Assistant Verified
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Your outstanding maintenance balance is <strong className="text-foreground font-semibold">₹4,000</strong> for October 2026.
                        </p>
                        <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Invoice #INV-2026-10-402</span>
                          <Link href="/maintenance" className="text-[#315CF5] font-medium hover:underline flex items-center gap-0.5">
                            Pay Now <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#315CF5] px-3.5 py-2.5 text-xs text-white shadow-sm">
                        Are pets allowed in the central garden?
                      </div>

                      <div className="mr-auto max-w-[90%] rounded-2xl rounded-tl-sm border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121319] p-3 text-xs shadow-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#315CF5] mb-1">
                          <Sparkles className="h-3 w-3" />
                          Bylaw clause 4.2
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Yes, leashed pets are permitted in designated walking zones of the central garden between 6:00 AM – 9:00 AM and 6:00 PM – 9:00 PM.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Input Box Illusion */}
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#101115] px-3 py-2 text-xs text-muted-foreground">
                      <span className="flex-1">Ask anything about dues, receipts, or rules...</span>
                      <div className="h-6 w-6 rounded-lg bg-[#315CF5] text-white flex items-center justify-center">
                        <Send className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. EDITORIAL PRODUCT INTRODUCTION (Two-Column Asymmetric)
         ======================================================== */}
      <section id="platform" className="border-t border-b border-black/[0.08] dark:border-white/[0.08] py-24 sm:py-32 bg-white dark:bg-[#0c0d12]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Oversized Statement Heading */}
            <div className="lg:col-span-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#315CF5] font-semibold">
                Platform Architecture
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter-editorial leading-[1.05] text-[#101114] dark:text-[#F8FAFC]">
                Everything your society needs. <br />
                <span className="text-[#626773] dark:text-[#94A3B8]">
                  One intelligent platform.
                </span>
              </h2>
            </div>

            {/* Right Column: Editorial narrative description */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-base sm:text-lg text-[#626773] dark:text-[#94A3B8] leading-relaxed">
              <p>
                Traditional resident portals are bloated, fragmented, and full of friction. Committee members spend hours answering repetitive queries about payment status, while residents struggle to locate basic bills.
              </p>
              <p>
                SocietyAI unifies maintenance tracking, automated invoice generation, verified payment logs, and resident bylaws under an AI-first operational architecture. Every question is answered in seconds, every transaction is audited.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-black/[0.08] dark:border-white/[0.08]">
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">For Residents</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Instant balance checks, digital invoice downloads, and prompt answers in natural language.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">For Management</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Zero manual billing overhead, instant delinquency visibility, and automated compliance tracking.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. FEATURE SHOWCASE (Numbered Editorial Chapters 01 - 04)
         ======================================================== */}
      <section id="features" className="py-24 sm:py-32 bg-[#F7F8FA] dark:bg-[#090A0D]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-8 mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#315CF5] font-semibold">
                Feature Index
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter-editorial text-foreground">
                Art-directed capabilities
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md">
              Engineered with purpose. Each module solves a fundamental workflow problem in residential administration.
            </p>
          </div>

          <div className="space-y-24 sm:space-y-32">
            
            {/* 01 — Maintenance Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="font-mono text-3xl sm:text-4xl font-light text-[#315CF5]">01</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Maintenance Management
                </h3>
                <p className="mt-4 text-base sm:text-lg text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                  Track pending and settled maintenance records with granular breakdown across flats, wings, and fee components. Avoid manual bookkeeping mistakes.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#315CF5]" />
                    <span>Real-time dues calculation with late fee automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#315CF5]" />
                    <span>Flat-wise and tower-wise ledger views</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#315CF5]" />
                    <span>Instant payment status synchronization</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#121319] p-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <span className="text-xs font-mono uppercase text-muted-foreground">Live Ledger View</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">Tower B / 4th Floor</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F7F8FA] dark:bg-[#181922] flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Flat B-402 — Bhavya Sharma</p>
                        <p className="text-xs text-muted-foreground font-mono">Monthly Maintenance (3BHK Standard)</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-600 dark:text-amber-400">₹4,000</span>
                        <p className="text-[10px] uppercase font-mono text-amber-600">Due in 5 days</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F7F8FA] dark:bg-[#181922] flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Flat B-403 — Rajesh Patel</p>
                        <p className="text-xs text-muted-foreground font-mono">Monthly Maintenance + Parking</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹4,500</span>
                        <p className="text-[10px] uppercase font-mono text-emerald-600">Settled (UPI)</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F7F8FA] dark:bg-[#181922] flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Flat B-404 — Meera Sengupta</p>
                        <p className="text-xs text-muted-foreground font-mono">Monthly Maintenance (2BHK)</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹3,200</span>
                        <p className="text-[10px] uppercase font-mono text-emerald-600">Settled (Card)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 — Payment Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#121319] p-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <span className="text-xs font-mono uppercase text-muted-foreground">Automated Reconciliation</span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Webhook 200 OK
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#181922] border border-border/40">
                      <span className="text-xs text-muted-foreground font-mono">COLLECTED THIS MONTH</span>
                      <p className="text-2xl font-bold mt-1 text-foreground">₹3,84,000</p>
                      <p className="text-xs text-emerald-600 mt-1">↑ 96% collected on-time</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#181922] border border-border/40">
                      <span className="text-xs text-muted-foreground font-mono">OUTSTANDING BALANCE</span>
                      <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">₹16,000</p>
                      <p className="text-xs text-muted-foreground mt-1">4 units pending reminder</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg border border-dashed border-border flex items-center justify-between text-xs font-mono">
                    <span>Audit trail: #TXN-99418290 via Razorpay/UPI</span>
                    <span className="text-[#315CF5]">Reconciled</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="font-mono text-3xl sm:text-4xl font-light text-[#315CF5]">02</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Payment Tracking
                </h3>
                <p className="mt-4 text-base sm:text-lg text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                  Transparent multi-mode payment workflows. Residents see immediate verification while society accountants receive automated audit trails with bank reconciliation.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-border">UPI &amp; QR CODES</span>
                  <span className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-border">NETBANKING</span>
                  <span className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-border">CARDS</span>
                  <span className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-border">OFFLINE CHEQUE LOGS</span>
                </div>
              </div>
            </div>

            {/* 03 — Digital Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="font-mono text-3xl sm:text-4xl font-light text-[#315CF5]">03</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Digital Invoices
                </h3>
                <p className="mt-4 text-base sm:text-lg text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                  Never search through paper slips or old email chains. Access formatted, GST-ready digital invoices and historical receipts anytime from your resident portal.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#315CF5]" />
                    <span>Instant PDF receipt generation with unique serial codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#315CF5]" />
                    <span>Permanent multi-year digital archives</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#315CF5]" />
                    <span>One-click download for tax and ownership documentation</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#121319] p-6 shadow-xl">
                  <div className="rounded-xl border border-border/60 bg-[#F7F8FA] dark:bg-[#161720] p-5">
                    <div className="flex justify-between items-start border-b border-border/50 pb-4">
                      <div>
                        <span className="text-xs font-mono uppercase text-[#315CF5] font-bold">OFFICIAL TAX INVOICE</span>
                        <h4 className="text-base font-bold text-foreground mt-1">Palm Grove Cooperative Society</h4>
                        <p className="text-xs text-muted-foreground font-mono">Reg No: BOM/HSG/TC/1049/2018</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-xs font-semibold">PAID</span>
                        <p className="text-xs font-mono text-muted-foreground mt-1">INV-2026-09-402</p>
                      </div>
                    </div>
                    <div className="py-4 text-xs font-mono grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">BILLED TO:</span>
                        <p className="font-semibold text-foreground">Flat B-402 (Bhavya S.)</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">DATE ISSUED:</span>
                        <p className="font-semibold text-foreground">Sept 01, 2026</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Total Settled Amount</span>
                      <span className="text-base font-bold text-foreground">₹4,000.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 04 — AI-Powered Assistance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-[#101115] p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#315CF5]" />
                      <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">RAG Knowledge Engine</span>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">Embedding: Text-Embedding-004</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-neutral-300 font-mono">Resident Query</p>
                      <p className="text-sm text-white mt-1">&ldquo;Can I book the community hall for my daughter&apos;s birthday next Sunday?&rdquo;</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#315CF5]/15 border border-[#315CF5]/30">
                      <p className="text-xs text-[#819eff] font-mono flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> SocietyAI Grounded Answer
                      </p>
                      <p className="text-sm text-neutral-200 mt-1 leading-relaxed">
                        Yes, Sunday Oct 31 slot is currently open. Standard booking fee is ₹5,000 plus ₹2,000 refundable security deposit. Music must conclude by 10:00 PM per society noise rules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="font-mono text-3xl sm:text-4xl font-light text-[#315CF5]">04</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  AI-Powered Assistance
                </h3>
                <p className="mt-4 text-base sm:text-lg text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                  Trained on your society&apos;s exact bylaws, minutes of meetings, and individual resident ledgers. Residents get verified answers without texting managing committee members.
                </p>
                <div className="mt-6">
                  <Link
                    href="/ai"
                    className="bubble-cta bubble-cta-blue text-sm"
                  >
                    <span>Launch AI Concierge</span>
                    <span className="bubble-cta-arrow">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          5. AI ASSISTANT SHOWCASE (Contrasting Dark Editorial Section)
         ======================================================== */}
      <section id="ai" className="relative py-24 sm:py-32 bg-[#101114] text-[#F8FAFC] overflow-hidden">
        
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#315CF5]/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 sm:px-8 relative z-10">
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-[#819eff]">
              <Sparkles className="h-3 w-3" />
              <span>Grounded Intelligence</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter-editorial leading-[1.05]">
              Answers, without <br />
              <span className="text-[#315CF5]">the waiting.</span>
            </h2>
            <p className="mt-6 text-base sm:text-xl text-neutral-400 max-w-xl leading-relaxed">
              Ask about maintenance, payments, invoices, and bylaws. SocietyAI helps residents find the information they need in seconds.
            </p>
          </div>

          {/* Interactive AI Preview Matrix */}
          <div className="mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 4 Cols: Conversation Prompts Selector */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
                Select Test Scenario:
              </span>
              {aiConversations.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAiDemo(idx)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeAiDemo === idx
                      ? "border-[#315CF5] bg-[#315CF5]/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="text-[11px] font-mono uppercase text-[#315CF5] font-semibold block">
                    {item.tag}
                  </span>
                  <p className="mt-1 text-sm font-medium line-clamp-2">
                    &ldquo;{item.q}&rdquo;
                  </p>
                </button>
              ))}

              <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-neutral-400">
                <span className="text-white font-medium block mb-1">How it works:</span>
                Uses LangChain RAG for society documents + deterministic database tools for accurate billing lookups.
              </div>
            </div>

            {/* Right 8 Cols: Large Editorial Chat Window */}
            <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#16171E] p-6 sm:p-8 shadow-2xl">
              
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#315CF5] text-white flex items-center justify-center font-bold">
                    AI
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">SocietyAI Concierge</h3>
                    <p className="text-xs font-mono text-neutral-400">
                      Active Session • Latency: 184ms
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tool Calling Ready
                </span>
              </div>

              {/* Chat Output Area */}
              <div className="py-8 space-y-6">
                
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#315CF5] px-5 py-3.5 text-sm sm:text-base text-white shadow-md">
                    {aiConversations[activeAiDemo].q}
                  </div>
                </div>

                {/* AI Grounded Response */}
                <div className="flex justify-start">
                  <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-white/10 bg-[#1F202B] p-5 sm:p-6 shadow-md">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#819eff] mb-3">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>SOCIETYAI AUDITED ANSWER</span>
                      <span>•</span>
                      <span>{aiConversations[activeAiDemo].tag}</span>
                    </div>

                    <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                      {aiConversations[activeAiDemo].a}
                    </p>

                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
                      <span className="font-mono">Intent: {aiConversations[activeAiDemo].intent}</span>
                      <Link
                        href="/ai"
                        className="text-[#315CF5] hover:text-[#819eff] font-medium flex items-center gap-1 transition"
                      >
                        Try with your society data <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Banner */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-mono text-neutral-400">
                  Ready to test with your flat details?
                </span>
                <Link
                  href="/login"
                  className="bubble-cta bubble-cta-blue text-xs py-2 px-4"
                >
                  <span>Log in to test live assistant</span>
                  <span className="bubble-cta-arrow">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. ASYMMETRIC CAPABILITIES MATRIX
         ======================================================== */}
      <section className="py-24 sm:py-32 bg-[#F7F8FA] dark:bg-[#090A0D]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#315CF5] font-semibold">
              Deep Architecture
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter-editorial text-foreground">
              Built for precision at scale
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1 */}
            <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121319] p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-muted-foreground uppercase">01 / RECONCILIATION</span>
                <h3 className="mt-3 text-xl font-semibold text-foreground">Payment Visibility</h3>
                <p className="mt-3 text-sm text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                  Real-time synchronization between bank gateways and apartment units. Zero ledger ambiguity, zero double-charges.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/40 font-mono text-xs text-[#315CF5]">
                ✓ Bank-grade ledger records
              </div>
            </div>

            {/* Box 2 - Highlighted */}
            <div className="rounded-2xl border border-[#315CF5]/30 bg-white dark:bg-[#141620] p-8 flex flex-col justify-between shadow-lg shadow-[#315CF5]/5">
              <div>
                <span className="font-mono text-xs text-[#315CF5] uppercase font-semibold">02 / COMPLIANCE</span>
                <h3 className="mt-3 text-xl font-semibold text-foreground">GST &amp; Invoice Access</h3>
                <p className="mt-3 text-sm text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                  Every maintenance cycle generates verified digital tax receipts. Easily downloadable for property tax filing.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/40 font-mono text-xs text-[#315CF5]">
                ✓ Standardized PDF invoicing
              </div>
            </div>

            {/* Box 3 */}
            <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121319] p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-muted-foreground uppercase">03 / HISTORICAL LOGS</span>
                <h3 className="mt-3 text-xl font-semibold text-foreground">Audited Records</h3>
                <p className="mt-3 text-sm text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                  Complete historical maintenance archives. Resident transfers and tenancy handovers maintain clean financial continuity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/40 font-mono text-xs text-[#315CF5]">
                ✓ Tamper-evident ledger log
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. HOW IT WORKS (3-Step Editorial Workflow)
         ======================================================== */}
      <section id="workflow" className="border-t border-black/[0.08] dark:border-white/[0.08] py-24 sm:py-32 bg-white dark:bg-[#0c0d12]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-8 mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#315CF5] font-semibold">
                Process
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter-editorial text-foreground">
                How SocietyAI operates
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md">
              A frictionless 3-step lifecycle designed around everyday residential needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            <div className="flex flex-col">
              <div className="font-mono text-4xl sm:text-5xl font-light text-[#315CF5]">
                01
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                Create your account
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                Residents and committee admins securely sign in using credentialed profiles mapped directly to flat and wing numbers.
              </p>
              <div className="mt-6 text-xs font-mono text-muted-foreground">
                → Secure JWT auth + RBAC
              </div>
            </div>

            <div className="flex flex-col">
              <div className="font-mono text-4xl sm:text-5xl font-light text-[#315CF5]">
                02
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                Access society information
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                View monthly maintenance breakdowns, upcoming payment deadlines, downloadable tax receipts, and general announcements.
              </p>
              <div className="mt-6 text-xs font-mono text-muted-foreground">
                → Real-time database sync
              </div>
            </div>

            <div className="flex flex-col">
              <div className="font-mono text-4xl sm:text-5xl font-light text-[#315CF5]">
                03
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                Manage and ask AI
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#626773] dark:text-[#94A3B8] leading-relaxed">
                Query the intelligent assistant in plain English for pending balances, policy questions, or parking rules at any hour.
              </p>
              <div className="mt-6 text-xs font-mono text-muted-foreground">
                → RAG + deterministic tools
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          8. PREMIUM FINAL CTA (Bold, Memorable, Clean Editorial)
         ======================================================== */}
      <section className="relative py-28 sm:py-36 bg-[#101114] text-[#F8FAFC] overflow-hidden">
        
        {/* Subtle dither pattern overlay on dark */}
        <div className="absolute inset-0 bg-dither-pattern opacity-10 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 sm:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-neutral-300">
            <span>RESIDENTIAL OPERATING SYSTEM</span>
          </div>

          <h2 className="mt-8 text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tighter-editorial leading-[0.98]">
            Your society. <br />
            <span className="text-[#315CF5]">Simplified.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-neutral-400 leading-relaxed">
            One platform for maintenance, payments, invoices, and intelligent assistance. Built for modern communities that value clarity and efficiency.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bubble-cta bubble-cta-blue text-base py-3 px-8"
            >
              <span>Get Started Now</span>
              <span className="bubble-cta-arrow">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/login"
              className="bubble-cta bubble-cta-ghost text-base py-3 px-6 text-white border-white/20"
            >
              <span>Sign In to Your Society</span>
              <span className="bubble-cta-arrow">
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-neutral-500">
            <span>NO CREDIT CARD REQUIRED</span>
            <span>•</span>
            <span>SELF-HOSTED OR CLOUD READY</span>
            <span>•</span>
            <span>REST API AVAILABLE</span>
          </div>

        </div>
      </section>

      {/* ========================================================
          9. FOOTER (Minimal, refined, Legency Media hierarchy)
         ======================================================== */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#090A0D] py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-black/[0.08] dark:border-white/[0.08]">
            
            {/* Brand column */}
            <div className="md:col-span-5">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#14151B] border border-black/[0.08] dark:border-white/[0.1]">
                  <img
                    src={resolved === "dark" ? "/logo.png" : "/logo-light.png"}
                    alt="SocietyAI"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <span className="font-semibold text-lg tracking-tight-editorial font-sans">
                  Society<span className="text-[#315CF5]">AI</span>
                </span>
              </Link>
              <p className="mt-4 text-sm text-[#626773] dark:text-[#94A3B8] max-w-sm leading-relaxed">
                An intelligent residential management platform unifying maintenance tracking, automated invoice generation, and natural language assistance.
              </p>
              <div className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>All services operational</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold">
                Platform
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="#platform" className="text-muted-foreground hover:text-foreground transition">
                    Platform Overview
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition">
                    Maintenance Tracking
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition">
                    Payment Reconciliation
                  </Link>
                </li>
                <li>
                  <Link href="#ai" className="text-muted-foreground hover:text-foreground transition">
                    AI Concierge (RAG)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resident access */}
            <div className="md:col-span-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold">
                Resident Portal
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition">
                    Resident Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-muted-foreground hover:text-foreground transition">
                    Register New Flat Account
                  </Link>
                </li>
                <li>
                  <Link href="/maintenance" className="text-muted-foreground hover:text-foreground transition">
                    Check Pending Maintenance
                  </Link>
                </li>
                <li>
                  <Link href="/ai" className="text-muted-foreground hover:text-foreground transition">
                    Open AI Chat Assistant
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom copyright & attribution */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#626773] dark:text-[#94A3B8]">
            <p>© {new Date().getFullYear()} SocietyAI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>DESIGNED WITH EDITORIAL EXCELLENCE</span>
              <span>•</span>
              <span>VERCEL HOSTED</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}