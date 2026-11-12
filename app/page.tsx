"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import type { Profile, ProfileResponse } from "@/app/lib/types";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import {
  ArrowUpRight,
  Building2,
  LogOut,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Send,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAiDemo, setActiveAiDemo] = useState(0);
  const [user, setUser] = useState<Profile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await apiFetch<ProfileResponse>("/users/profile");
        if (!cancelled) {
          setUser(data.profile);
        }
      } catch {
        // Not signed in — keep the default marketing CTAs.
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await apiFetch("/users/logout", { method: "POST" });
    } catch {
      // Ignore; redirect regardless.
    } finally {
      setLoggingOut(false);
      setUser(null);
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const signedIn = Boolean(user);

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

  // Add a subtle border elevation once the page is scrolled.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reveal sections and cards as they enter the viewport.
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-300">
      
      {/* ========================================================
          1. NAVIGATION (Legency Media style: minimal, tactile, clean)
         ======================================================== */}
      <header
        className={`sticky top-0 z-50 border-b border-black/[0.06] bg-background/85 backdrop-blur-xl transition-shadow duration-300 dark:border-white/[0.08] dark:bg-background/85 ${
          scrolled ? "shadow-[0_12px_36px_-28px_rgba(0,0,0,0.45)]" : ""
        }`}
      >
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-3 px-4 sm:h-20 sm:px-8 lg:px-10 2xl:px-16">
          
          {/* Brand Logo & Editorial Wordmark */}
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-white/[0.1] dark:bg-card sm:h-10 sm:w-10">
              <Building2 className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 font-sans text-base font-semibold leading-none tracking-tight-editorial sm:text-lg">
                Society<span className="text-primary">AI</span>
                <span className="hidden rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-normal text-muted-foreground dark:bg-white/[0.08] sm:inline-block">
                  v2.4
                </span>
              </span>
              <span className="mt-0.5 hidden font-mono text-[11px] tracking-wide text-muted-foreground sm:block">
                RESIDENTIAL OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex xl:gap-9">
            <Link
              href="#platform"
              className="text-sm font-medium text-muted-foreground dark:text-muted-foreground transition-colors hover:text-foreground dark:hover:text-white"
            >
              Platform
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground dark:text-muted-foreground transition-colors hover:text-foreground dark:hover:text-white"
            >
              Capabilities
            </Link>
            <Link
              href="#ai"
              className="text-sm font-medium text-muted-foreground dark:text-muted-foreground transition-colors hover:text-foreground dark:hover:text-white flex items-center gap-1.5"
            >
              <span>AI Assistant</span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </Link>
            <Link
              href="#workflow"
              className="text-sm font-medium text-muted-foreground dark:text-muted-foreground transition-colors hover:text-foreground dark:hover:text-white"
            >
              Workflow
            </Link>
          </nav>

          {/* Right Action Stack: Theme Switcher + Login + Bubble CTA */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {signedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors disabled:opacity-50"
              >
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}

            <div className="hidden sm:block">
              {signedIn ? (
                <Link
                  href="/dashboard"
                  className="bubble-cta bubble-cta-primary"
                >
                  <span>Go to Dashboard</span>
                  <span className="bubble-cta-arrow">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="bubble-cta bubble-cta-primary"
                >
                  <span>Get Started</span>
                  <span className="bubble-cta-arrow">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              )}
            </div>

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] text-foreground transition-colors hover:bg-black/5 dark:border-white/[0.1] dark:hover:bg-white/5 sm:h-10 sm:w-10 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="animate-fade-down max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-black/[0.08] bg-background px-4 py-5 dark:border-white/[0.1] dark:bg-background sm:px-6 sm:py-6 lg:hidden">
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
                {signedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium disabled:opacity-50"
                  >
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium"
                  >
                    Sign In
                  </Link>
                )}

                {signedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION — OVERSIDED EDITORIAL COMPOSITION
         ======================================================== */}
      <section className="relative overflow-hidden bg-dither-pattern pb-16 pt-8 sm:pb-24 sm:pt-14 lg:pb-28 lg:pt-16">
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float-delayed pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="relative mx-auto w-full px-4 sm:px-8 lg:px-10 2xl:px-16">
          {/* Editorial Sub-bar & Metadata badge */}
          <div className="animate-fade-up flex w-full items-center justify-between gap-4 border-b border-black/[0.08] pb-5 dark:border-white/[0.08] sm:pb-6">
            <div className="inline-flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground dark:text-muted-foreground sm:text-xs sm:tracking-widest">
                Next-Gen Residential Intelligence
              </span>
            </div>
            <div className="hidden items-center gap-6 font-mono text-xs text-muted-foreground dark:text-muted-foreground sm:flex">
              <span>RAG RETRIEVAL 2.0</span>
              <span>•</span>
              <span>INSTANT RECONCILIATION</span>
              <span>•</span>
              <span>RESIDENT OS</span>
            </div>
          </div>

          {/* Hero Headline — Bold, Editorial, Confident */}
          <div
            className="animate-fade-up mt-8 max-w-5xl sm:mt-14 lg:mt-16"
            style={{ animationDelay: "80ms" }}
          >
            <h1 className="text-balance text-[2.5rem] font-semibold leading-[0.98] tracking-tighter-editorial text-foreground dark:text-foreground min-[380px]:text-[2.75rem] sm:text-6xl lg:text-7xl xl:text-[84px]">
              Society management. <br />
              <span className="mt-1 inline-block bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent animate-gradient-pan sm:mt-2">
                Reimagined with AI.
              </span>
            </h1>
          </div>

          {/* Two-Column Pitch & Action Bar */}
          <div
            className="animate-fade-up mt-8 grid grid-cols-1 items-end gap-7 border-b border-black/[0.08] pb-10 dark:border-white/[0.08] sm:mt-12 sm:gap-8 sm:pb-12 lg:grid-cols-12"
            style={{ animationDelay: "160ms" }}
          >
            <div className="lg:col-span-7">
              <p className="max-w-2xl text-pretty text-base font-normal leading-relaxed text-muted-foreground dark:text-muted-foreground sm:text-xl md:text-2xl">
                Manage maintenance, track payments, access invoices, and get instant answers with an AI assistant built for modern residential communities.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center lg:col-span-5 sm:justify-end">
              {signedIn ? (
                <Link
                  href="/dashboard"
                  className="bubble-cta bubble-cta-primary w-full justify-between text-base py-2.5 px-6 min-[420px]:w-auto"
                >
                  <span>Open Dashboard</span>
                  <span className="bubble-cta-arrow">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="bubble-cta bubble-cta-primary w-full justify-between text-base py-2.5 px-6 min-[420px]:w-auto"
                >
                  <span>Get Started Now</span>
                  <span className="bubble-cta-arrow">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              )}
              <Link
                href="#platform"
                className="bubble-cta bubble-cta-ghost w-full justify-between text-base py-2.5 px-5 min-[420px]:w-auto"
              >
                <span>Explore Features</span>
                <span className="bubble-cta-arrow">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* Proof / Metric Pillars — Legency Media inspired */}
          <div
            className="animate-fade-up grid grid-cols-2 gap-5 border-b border-black/[0.08] py-7 dark:border-white/[0.08] sm:grid-cols-4 sm:gap-6 sm:py-8"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground dark:text-white">
                100%
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground font-normal mt-1">
                Automated invoice dispatch
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground dark:text-white">
                &lt; 2s
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground font-normal mt-1">
                AI response query latency
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground dark:text-white">
                ₹0 Leakage
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground font-normal mt-1">
                Audited ledger reconciliation
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground dark:text-white">
                24/7
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground font-normal mt-1">
                Bylaws &amp; dues assistant
              </span>
            </div>
          </div>

          {/* Hero Visual: Realistic Studio Product Interface Showcase */}
          <div
            className="animate-fade-up mt-10 sm:mt-16"
            style={{ animationDelay: "320ms" }}
          >
            <div className="relative rounded-2xl border border-black/[0.1] bg-card p-2.5 shadow-2xl shadow-black/10 transition-transform duration-500 hover:-translate-y-1 dark:border-white/[0.12] dark:shadow-black/60 sm:rounded-3xl sm:p-5">
              
              {/* Studio Browser Header */}
              <div className="flex items-center justify-between gap-2 border-b border-black/[0.06] px-1 pb-3 dark:border-white/[0.06] sm:px-2">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80 sm:h-3 sm:w-3" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 sm:h-3 sm:w-3" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80 sm:h-3 sm:w-3" />
                  <span className="ml-2 hidden truncate font-mono text-xs text-muted-foreground sm:inline-block">
                    app.societyai.io/dashboard/society-overview
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 sm:px-2.5 sm:text-xs">
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
                  <div className="rounded-xl border border-black/[0.06] bg-background/60 p-4 dark:border-white/[0.08] dark:bg-card/60 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-mono text-[10px] font-semibold uppercase text-primary sm:text-xs">
                            RESIDENCE B-402
                          </span>
                          <span className="text-[10px] text-muted-foreground sm:text-xs">• Palm Grove Residency</span>
                        </div>
                        <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                          Welcome back, Resident
                        </h3>
                      </div>
                      <Link
                        href="/maintenance"
                        className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Pay Maintenance
                      </Link>
                    </div>

                    {/* Metrics Grid */}
                    <div className="mt-4 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-3 sm:mt-5 sm:gap-3">
                      <div className="rounded-lg border border-black/[0.06] bg-card p-3 dark:border-white/[0.06] sm:p-3.5">
                        <span className="text-xs text-muted-foreground font-medium">Pending Dues</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">₹4,000</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Due Oct 10, 2026</span>
                      </div>

                      <div className="rounded-lg border border-black/[0.06] bg-card p-3 dark:border-white/[0.06] sm:p-3.5">
                        <span className="text-xs font-medium text-muted-foreground">Last Payment</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl">₹4,000</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">✓ Sept Verified</span>
                      </div>

                      <div className="rounded-lg border border-black/[0.06] bg-card p-3 dark:border-white/[0.06] sm:p-3.5">
                        <span className="text-xs font-medium text-muted-foreground">Invoices Issued</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-bold text-foreground sm:text-2xl">12</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">FY 2026-27</span>
                      </div>
                    </div>
                  </div>

                  {/* Transactions / Invoices Table snippet */}
                  <div className="rounded-xl border border-black/[0.06] bg-card p-3.5 dark:border-white/[0.08] sm:p-4">
                    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
                      <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                        Recent Billing &amp; Receipts
                      </span>
                      <Link href="/maintenance" className="shrink-0 text-xs font-medium text-primary hover:underline">
                        View All
                      </Link>
                    </div>
                    <div className="mt-3 divide-y divide-border/40 text-xs sm:text-sm">
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600">
                            INV
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">Maintenance Fee — Oct 2026</p>
                            <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">INV-2026-10-402 • Regular</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-amber-600 dark:text-amber-400">₹4,000</p>
                          <span className="inline-block rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber-600">Pending</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            RCP
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">Maintenance Fee — Sep 2026</p>
                            <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">RCP-2026-09-881 • HDFC UPI</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹4,000</p>
                          <span className="inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-emerald-600">Settled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: AI Copilot Assistant Widget Showcase */}
                <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-background/80 dark:bg-card p-4 sm:p-5">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
                      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-xs text-primary-foreground shadow-sm">
                        How much maintenance do I have pending?
                      </div>

                      <div className="mr-auto max-w-[90%] rounded-2xl rounded-tl-sm border border-black/[0.06] dark:border-white/[0.08] bg-card p-3 text-xs shadow-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary mb-1">
                          <Sparkles className="h-3 w-3" />
                          Assistant Verified
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Your outstanding maintenance balance is <strong className="text-foreground font-semibold">₹4,000</strong> for October 2026.
                        </p>
                        <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Invoice #INV-2026-10-402</span>
                          <Link href="/maintenance" className="text-primary font-medium hover:underline flex items-center gap-0.5">
                            Pay Now <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-xs text-primary-foreground shadow-sm">
                        Are pets allowed in the central garden?
                      </div>

                      <div className="mr-auto max-w-[90%] rounded-2xl rounded-tl-sm border border-black/[0.06] dark:border-white/[0.08] bg-card p-3 text-xs shadow-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary mb-1">
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
                    <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-card px-3 py-2 text-xs text-muted-foreground">
                      <span className="flex-1">Ask anything about dues, receipts, or rules...</span>
                      <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
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
      <section id="platform" className="scroll-mt-20 border-b border-t border-black/[0.08] bg-background py-16 dark:border-white/[0.08] sm:py-24 lg:py-32">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-10 2xl:px-16">
          
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16" data-reveal>
            
            {/* Left Column: Oversized Statement Heading */}
            <div className="lg:col-span-6">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
                Platform Architecture
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter-editorial leading-[1.05] text-foreground dark:text-foreground">
                Everything your society needs. <br />
                <span className="text-muted-foreground dark:text-muted-foreground">
                  One intelligent platform.
                </span>
              </h2>
            </div>

            {/* Right Column: Editorial narrative description */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-base sm:text-lg text-muted-foreground dark:text-muted-foreground leading-relaxed">
              <p>
                Traditional resident portals are bloated, fragmented, and full of friction. Committee members spend hours answering repetitive queries about payment status, while residents struggle to locate basic bills.
              </p>
              <p>
                SocietyAI unifies maintenance tracking, automated invoice generation, verified payment logs, and resident bylaws under an AI-first operational architecture. Every question is answered in seconds, every transaction is audited.
              </p>

              <div className="grid grid-cols-1 gap-4 border-t border-black/[0.08] pt-4 dark:border-white/[0.08] min-[420px]:grid-cols-2">
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
      <section id="features" className="scroll-mt-20 bg-background py-16 dark:bg-background sm:py-24 lg:py-32">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-10 2xl:px-16">
          
          <div className="mb-12 flex flex-wrap items-end justify-between gap-5 border-b border-black/[0.08] pb-8 dark:border-white/[0.08] sm:mb-16 sm:gap-6" data-reveal>
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
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

          <div className="space-y-16 sm:space-y-24 lg:space-y-32">
            
            {/* 01 — Maintenance Management */}
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16" data-reveal>
              <div className="order-2 lg:order-1 lg:col-span-5">
                <div className="font-mono text-3xl font-light text-primary sm:text-4xl">01</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Maintenance Management
                </h3>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Track pending and settled maintenance records with granular breakdown across flats, wings, and fee components. Avoid manual bookkeeping mistakes.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Real-time dues calculation with late fee automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Flat-wise and tower-wise ledger views</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Instant payment status synchronization</span>
                  </li>
                </ul>
              </div>

              <div className="order-1 lg:order-2 lg:col-span-7">
                <div className="rounded-2xl border border-black/[0.08] bg-card p-4 shadow-xl dark:border-white/[0.1] sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
                    <span className="font-mono text-[10px] uppercase text-muted-foreground sm:text-xs">Live Ledger View</span>
                    <span className="rounded bg-black/5 px-2 py-0.5 font-mono text-[10px] dark:bg-white/5 sm:text-xs">Tower B / 4th Floor</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-background p-3 dark:border-white/[0.06] dark:bg-card sm:p-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold sm:text-sm">Flat B-402 — Bhavya Sharma</p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">Monthly Maintenance (3BHK Standard)</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-bold text-amber-600 dark:text-amber-400">₹4,000</span>
                        <p className="font-mono text-[10px] uppercase text-amber-600">Due in 5 days</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-background p-3 dark:border-white/[0.06] dark:bg-card sm:p-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold sm:text-sm">Flat B-403 — Rajesh Patel</p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">Monthly Maintenance + Parking</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹4,500</span>
                        <p className="font-mono text-[10px] uppercase text-emerald-600">Settled (UPI)</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-background p-3 dark:border-white/[0.06] dark:bg-card sm:p-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold sm:text-sm">Flat B-404 — Meera Sengupta</p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">Monthly Maintenance (2BHK)</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹3,200</span>
                        <p className="font-mono text-[10px] uppercase text-emerald-600">Settled (Card)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 — Payment Tracking */}
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16" data-reveal>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-black/[0.08] bg-card p-4 shadow-xl dark:border-white/[0.1] sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
                    <span className="font-mono text-[10px] uppercase text-muted-foreground sm:text-xs">Automated Reconciliation</span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 sm:text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Webhook 200 OK
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
                    <div className="rounded-xl border border-border/40 bg-background p-4 dark:bg-card">
                      <span className="font-mono text-[10px] text-muted-foreground sm:text-xs">COLLECTED THIS MONTH</span>
                      <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">₹3,84,000</p>
                      <p className="mt-1 text-[11px] text-emerald-600 sm:text-xs">↑ 96% collected on-time</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background p-4 dark:bg-card">
                      <span className="font-mono text-[10px] text-muted-foreground sm:text-xs">OUTSTANDING BALANCE</span>
                      <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400 sm:text-2xl">₹16,000</p>
                      <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">4 units pending reminder</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 font-mono text-[10px] min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:text-xs">
                    <span className="truncate">Audit trail: #TXN-99418290 via Razorpay/UPI</span>
                    <span className="shrink-0 text-primary">Reconciled</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="font-mono text-3xl sm:text-4xl font-light text-primary">02</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Payment Tracking
                </h3>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground dark:text-muted-foreground leading-relaxed">
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
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16" data-reveal>
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="font-mono text-3xl sm:text-4xl font-light text-primary">03</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Digital Invoices
                </h3>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Never search through paper slips or old email chains. Access formatted, GST-ready digital invoices and historical receipts anytime from your resident portal.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Instant PDF receipt generation with unique serial codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Permanent multi-year digital archives</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>One-click download for tax and ownership documentation</span>
                  </li>
                </ul>
              </div>

              <div className="order-1 lg:order-2 lg:col-span-7">
                <div className="rounded-2xl border border-black/[0.08] bg-card p-3.5 shadow-xl dark:border-white/[0.1] sm:p-6">
                  <div className="rounded-xl border border-border/60 bg-background p-4 dark:bg-card sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-4">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-bold uppercase text-primary sm:text-xs">OFFICIAL TAX INVOICE</span>
                        <h4 className="mt-1 text-sm font-bold text-foreground sm:text-base">Palm Grove Cooperative Society</h4>
                        <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">Reg No: BOM/HSG/TC/1049/2018</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 sm:text-xs">PAID</span>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground sm:text-xs">INV-2026-09-402</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 py-4 font-mono text-[10px] min-[420px]:grid-cols-2 min-[420px]:gap-4 sm:text-xs">
                      <div>
                        <span className="text-muted-foreground">BILLED TO:</span>
                        <p className="font-semibold text-foreground">Flat B-402 (Bhavya S.)</p>
                      </div>
                      <div className="min-[420px]:text-right">
                        <span className="text-muted-foreground">DATE ISSUED:</span>
                        <p className="font-semibold text-foreground">Sept 01, 2026</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                      <span className="text-xs font-semibold text-foreground">Total Settled Amount</span>
                      <span className="text-base font-bold text-foreground">₹4,000.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 04 — AI-Powered Assistance */}
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16" data-reveal>
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-black/[0.08] bg-[#10150f] p-4 text-white shadow-xl dark:border-white/[0.1] sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#79c9a6]" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 sm:text-xs">RAG Knowledge Engine</span>
                    </div>
                    <span className="hidden font-mono text-[10px] text-neutral-400 sm:inline sm:text-xs">Embedding: Text-Embedding-004</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-neutral-300 font-mono">Resident Query</p>
                      <p className="text-sm text-white mt-1">&ldquo;Can I book the community hall for my daughter&apos;s birthday next Sunday?&rdquo;</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#79c9a6]/10 border border-[#79c9a6]/30">
                      <p className="text-xs text-[#79c9a6] font-mono flex items-center gap-1.5">
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
                <div className="font-mono text-3xl sm:text-4xl font-light text-primary">04</div>
                <h3 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  AI-Powered Assistance
                </h3>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Trained on your society&apos;s exact bylaws, minutes of meetings, and individual resident ledgers. Residents get verified answers without texting managing committee members.
                </p>
                <div className="mt-6">
                  <Link
                    href="/ai"
                    className="bubble-cta bubble-cta-primary text-sm"
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
      <section id="ai" className="relative scroll-mt-20 overflow-hidden bg-[#10150f] py-16 text-[#f5f5f1] sm:py-24 lg:py-32">
        
        {/* Glow ambient accent */}
        <div className="animate-float pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-[#79c9a6]/10 blur-3xl" />

        <div className="relative z-10 mx-auto w-full px-4 sm:px-8 lg:px-10 2xl:px-16">
          
          <div className="max-w-3xl" data-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-[#79c9a6]">
              <Sparkles className="h-3 w-3" />
              <span>Grounded Intelligence</span>
            </div>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-tighter-editorial sm:text-5xl lg:text-6xl">
              Answers, without <br />
              <span className="text-[#79c9a6]">the waiting.</span>
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-neutral-400 sm:mt-6 sm:text-xl">
              Ask about maintenance, payments, invoices, and bylaws. SocietyAI helps residents find the information they need in seconds.
            </p>
          </div>

          {/* Interactive AI Preview Matrix */}
          <div className="mt-10 grid grid-cols-1 items-start gap-6 sm:mt-14 sm:gap-8 lg:mt-16 lg:grid-cols-12" data-reveal>
            
            {/* Left 4 Cols: Conversation Prompts Selector */}
            <div className="flex flex-col gap-3 lg:col-span-4">
              <span className="mb-1 font-mono text-xs uppercase tracking-wider text-neutral-500 sm:mb-2">
                Select Example:
              </span>
              {aiConversations.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAiDemo(idx)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeAiDemo === idx
                      ? "border-[#79c9a6] bg-[#79c9a6]/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="text-[11px] font-mono uppercase text-[#79c9a6] font-semibold block">
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
            <div className="rounded-2xl border border-white/10 bg-[#151a16] p-4 shadow-2xl sm:p-6 lg:col-span-8 lg:p-8">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 sm:pb-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                    AI
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-white">SocietyAI Concierge</h3>
                    <p className="truncate font-mono text-[10px] text-neutral-400 sm:text-xs">
                      Grounded on society records
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-400 sm:text-xs">
                  Live Preview
                </span>
              </div>

              {/* Chat Output Area */}
              <div key={activeAiDemo} className="animate-fade-up space-y-5 py-6 sm:space-y-6 sm:py-8">
                
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-md sm:max-w-[85%] sm:px-5 sm:py-3.5 sm:text-base">
                    {aiConversations[activeAiDemo].q}
                  </div>
                </div>

                {/* AI Grounded Response */}
                <div className="flex justify-start">
                  <div className="max-w-full rounded-2xl rounded-tl-sm border border-white/10 bg-[#1a201b] p-4 shadow-md sm:max-w-[92%] sm:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#79c9a6] sm:text-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Verified answer</span>
                      <span aria-hidden>•</span>
                      <span>{aiConversations[activeAiDemo].tag}</span>
                    </div>

                    <p className="text-sm leading-relaxed text-neutral-200 sm:text-base">
                      {aiConversations[activeAiDemo].a}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-neutral-400">
                      <span className="font-mono">{aiConversations[activeAiDemo].intent}</span>
                      <Link
                        href="/ai"
                        className="flex items-center gap-1 font-medium text-[#79c9a6] transition-colors hover:text-[#79c9a6]/80"
                      >
                        Try with your society data <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Banner */}
              <div className="flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <span className="font-mono text-xs text-neutral-400">
                  Ready to test with your flat details?
                </span>
                {signedIn ? (
                  <Link
                    href="/ai"
                    className="bubble-cta bubble-cta-primary w-full justify-between px-4 py-2 text-xs sm:w-auto"
                  >
                    <span>Open AI Concierge</span>
                    <span className="bubble-cta-arrow">
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="bubble-cta bubble-cta-primary w-full justify-between px-4 py-2 text-xs sm:w-auto"
                  >
                    <span>Log in to test live assistant</span>
                    <span className="bubble-cta-arrow">
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </Link>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. ASYMMETRIC CAPABILITIES MATRIX
         ======================================================== */}
      <section className="bg-background py-16 dark:bg-background sm:py-24 lg:py-32">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-10 2xl:px-16">
          
          <div className="max-w-2xl" data-reveal>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Deep Architecture
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tighter-editorial text-foreground sm:text-4xl lg:text-5xl">
              Built for precision at scale
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
            
            {/* Box 1 */}
            <div className="flex flex-col justify-between rounded-2xl border border-black/[0.08] bg-card p-6 transition-transform duration-300 hover:-translate-y-1 dark:border-white/[0.08] sm:p-8" data-reveal>
              <div>
                <span className="font-mono text-xs text-muted-foreground uppercase">01 / RECONCILIATION</span>
                <h3 className="mt-3 text-xl font-semibold text-foreground">Payment Visibility</h3>
                <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Real-time synchronization between bank gateways and apartment units. Zero ledger ambiguity, zero double-charges.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/40 font-mono text-xs text-primary">
                ✓ Bank-grade ledger records
              </div>
            </div>

            {/* Box 2 - Highlighted */}
            <div className="flex flex-col justify-between rounded-2xl border border-primary/30 bg-card p-6 shadow-lg shadow-primary/5 transition-transform duration-300 hover:-translate-y-1 dark:bg-card sm:p-8" data-reveal>
              <div>
                <span className="font-mono text-xs text-primary uppercase font-semibold">02 / COMPLIANCE</span>
                <h3 className="mt-3 text-xl font-semibold text-foreground">GST &amp; Invoice Access</h3>
                <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Every maintenance cycle generates verified digital tax receipts. Easily downloadable for property tax filing.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/40 font-mono text-xs text-primary">
                ✓ Standardized PDF invoicing
              </div>
            </div>

            {/* Box 3 */}
            <div className="flex flex-col justify-between rounded-2xl border border-black/[0.08] bg-card p-6 transition-transform duration-300 hover:-translate-y-1 dark:border-white/[0.08] sm:p-8" data-reveal>
              <div>
                <span className="font-mono text-xs text-muted-foreground uppercase">03 / HISTORICAL LOGS</span>
                <h3 className="mt-3 text-xl font-semibold text-foreground">Audited Records</h3>
                <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Complete historical maintenance archives. Resident transfers and tenancy handovers maintain clean financial continuity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/40 font-mono text-xs text-primary">
                ✓ Tamper-evident ledger log
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. HOW IT WORKS (3-Step Editorial Workflow)
         ======================================================== */}
      <section id="workflow" className="scroll-mt-20 border-t border-black/[0.08] bg-background py-16 dark:border-white/[0.08] sm:py-24 lg:py-32">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-10 2xl:px-16">
          
          <div className="mb-12 flex flex-wrap items-end justify-between gap-5 border-b border-black/[0.08] pb-8 dark:border-white/[0.08] sm:mb-16 sm:gap-6" data-reveal>
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Process
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tighter-editorial text-foreground sm:text-4xl lg:text-5xl">
                How SocietyAI operates
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
              A frictionless 3-step lifecycle designed around everyday residential needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3" data-reveal>
            
            <div className="flex flex-col">
              <div className="font-mono text-4xl sm:text-5xl font-light text-primary">
                01
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                Create your account
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Residents and committee admins securely sign in using credentialed profiles mapped directly to flat and wing numbers.
              </p>
              <div className="mt-6 text-xs font-mono text-muted-foreground">
                → Secure JWT auth + RBAC
              </div>
            </div>

            <div className="flex flex-col">
              <div className="font-mono text-4xl sm:text-5xl font-light text-primary">
                02
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                Access society information
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground leading-relaxed">
                View monthly maintenance breakdowns, upcoming payment deadlines, downloadable tax receipts, and general announcements.
              </p>
              <div className="mt-6 text-xs font-mono text-muted-foreground">
                → Real-time database sync
              </div>
            </div>

            <div className="flex flex-col">
              <div className="font-mono text-4xl sm:text-5xl font-light text-primary">
                03
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                Manage and ask AI
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground leading-relaxed">
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
      <section className="relative overflow-hidden bg-[#10150f] py-20 text-[#f5f5f1] sm:py-28 lg:py-36">
        
        {/* Subtle dither pattern overlay on dark */}
        <div className="pointer-events-none absolute inset-0 bg-dither-pattern opacity-10" />
        <div className="animate-float pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#79c9a6]/10 blur-3xl" />

        <div className="relative z-10 mx-auto w-full px-4 text-center sm:px-8 lg:px-10 2xl:px-16" data-reveal>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-neutral-300 sm:text-xs">
            <span>RESIDENTIAL OPERATING SYSTEM</span>
          </div>

          <h2 className="mt-6 text-balance text-[2.75rem] font-semibold leading-[0.98] tracking-tighter-editorial sm:mt-8 sm:text-6xl lg:text-7xl xl:text-8xl">
            Your society. <br />
            <span className="text-[#79c9a6]">Simplified.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-400 sm:mt-6 sm:text-xl">
            One platform for maintenance, payments, invoices, and intelligent assistance. Built for modern communities that value clarity and efficiency.
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 min-[480px]:max-w-none min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center sm:mt-10">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="bubble-cta bubble-cta-primary justify-between px-8 py-3 text-base min-[480px]:w-auto"
              >
                <span>Open Dashboard</span>
                <span className="bubble-cta-arrow">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            ) : (
              <Link
                href="/signup"
                className="bubble-cta bubble-cta-primary justify-between px-8 py-3 text-base min-[480px]:w-auto"
              >
                <span>Get Started Now</span>
                <span className="bubble-cta-arrow">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            )}

            {signedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="bubble-cta bubble-cta-ghost justify-between border-white/20 px-6 py-3 text-base text-white disabled:opacity-50 min-[480px]:w-auto"
              >
                <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
                <span className="bubble-cta-arrow">
                  <LogOut className="h-4 w-4" />
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="bubble-cta bubble-cta-ghost justify-between border-white/20 px-6 py-3 text-base text-white min-[480px]:w-auto"
              >
                <span>Sign In to Your Society</span>
                <span className="bubble-cta-arrow">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            )}
          </div>

          <div className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[10px] text-neutral-500 sm:mt-14 sm:max-w-none sm:gap-8 sm:text-xs">
            <span>NO CREDIT CARD REQUIRED</span>
            <span aria-hidden>•</span>
            <span>SELF-HOSTED OR CLOUD READY</span>
            <span aria-hidden>•</span>
            <span>REST API AVAILABLE</span>
          </div>

        </div>
      </section>

      {/* ========================================================
          9. FOOTER (Minimal, refined, Legency Media hierarchy)
         ======================================================== */}
      <footer className="border-t border-black/[0.08] bg-background py-12 dark:border-white/[0.08] dark:bg-background sm:py-16">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-10 2xl:px-16">
          
          <div className="grid grid-cols-1 gap-8 border-b border-black/[0.08] pb-10 dark:border-white/[0.08] sm:grid-cols-2 sm:gap-10 sm:pb-12 md:grid-cols-12" data-reveal>
            
            {/* Brand column */}
            <div className="sm:col-span-2 md:col-span-5">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white dark:border-white/[0.1] dark:bg-card">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-lg tracking-tight-editorial font-sans">
                  Society<span className="text-primary">AI</span>
                </span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground dark:text-muted-foreground max-w-sm leading-relaxed">
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
          <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center font-mono text-xs text-muted-foreground dark:text-muted-foreground sm:flex-row sm:gap-4 sm:text-left">
            <p>© {new Date().getFullYear()} SocietyAI. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-6">
              <span>DESIGNED WITH EDITORIAL EXCELLENCE</span>
              <span aria-hidden>•</span>
              <span>VERCEL HOSTED</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}