"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "../components/layout/AppShell";
import MaintenanceCard from "../components/dashboard/MaintenanceCard";
import StatCard from "../components/ui/StatCard";
import { apiFetch } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type HistoryResponse,
  type PendingResponse,
  type Profile,
  type ProfileResponse,
} from "@/app/lib/types";
import {
  LayoutDashboard,
  Wrench,
  History,
  Bot,
  User,
  Shield,
  ArrowUpRight,
  Sparkles,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pending, setPending] = useState<PendingResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse["history"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profileData, pendingData, historyData] = await Promise.all([
          apiFetch<ProfileResponse>("/users/profile"),
          apiFetch<PendingResponse>("/maintenance/pending"),
          apiFetch<HistoryResponse>("/maintenance/history"),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(profileData.profile);
        setPending(pendingData);
        setHistory(historyData.history);
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load your dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const paidRecords = history.filter((record) => record.status === "paid");
  const totalPaid = paidRecords.reduce(
    (total, record) => total + record.monthlyAmount,
    0
  );
  const lastPayment = paidRecords[0] ?? null;

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#315CF5] font-semibold">
                Overview &bull; Resident Ledger
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              {loading
                ? "Welcome back"
                : `Welcome back, ${profile?.name ?? "Resident"}`}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              {profile
                ? `${profile.email} • ${profile.role === "admin" ? "Society Administrator" : "Active Resident"}`
                : "Real-time overview of your society maintenance and ledger."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/maintenance"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#315CF5] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#2549d4] transition"
            >
              <span>Manage Dues</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Financial Stat Cards (Linear / Stripe inspired) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Maintenance"
            value={formatCurrency(pending?.totalPending ?? 0)}
            description={
              pending?.nextDueDate
                ? `Due ${formatDate(pending.nextDueDate)}`
                : "All dues clear"
            }
            trend={
              (pending?.totalPending ?? 0) > 0
                ? { value: "Action needed", positive: false }
                : { value: "Clear", positive: true }
            }
            icon={<Wrench className="h-5 w-5" />}
          />

          <StatCard
            title="Monthly Base"
            value={formatCurrency(pending?.monthlyAmount ?? 0)}
            description="Per flat residential tariff"
            icon={<LayoutDashboard className="h-5 w-5" />}
          />

          <StatCard
            title="Settled To Date"
            value={formatCurrency(totalPaid)}
            description={`${paidRecords.length} verified transaction${paidRecords.length === 1 ? "" : "s"}`}
            trend={{ value: "Audited", positive: true }}
            icon={<History className="h-5 w-5" />}
          />

          <StatCard
            title="Latest Receipt"
            value={lastPayment ? formatCurrency(lastPayment.monthlyAmount) : "—"}
            description={
              lastPayment
                ? `${formatDate(lastPayment.paidAt ?? lastPayment.dueDate)} via ${
                    lastPayment.paymentMethod?.replace("_", " ") ?? "UPI"
                  }`
                : "No receipts yet"
            }
            icon={<Receipt className="h-5 w-5" />}
          />
        </div>

        {/* Main Grid: Maintenance Summary Card & AI Concierge Card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          <div className="lg:col-span-8">
            <MaintenanceCard
              pendingAmount={pending?.totalPending ?? 0}
              monthlyAmount={pending?.monthlyAmount ?? 0}
              dueDate={
                pending?.nextDueDate
                  ? formatDate(pending.nextDueDate)
                  : "No pending due date"
              }
            />
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-gradient-to-b from-[#101115] to-[#171821] p-6 text-white flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#315CF5] text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                  RAG Agent
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold tracking-tight">
                SocietyAI Concierge
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Have questions about your bills, penalty waivers, clubhouse rules, or meeting minutes? Ask in natural language.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-300 font-mono">
                &ldquo;What is my pending maintenance balance?&rdquo;
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Link
                href="/ai"
                className="flex items-center justify-between rounded-xl bg-white text-[#101114] px-4 py-2.5 text-xs font-semibold hover:bg-neutral-100 transition"
              >
                <span>Launch AI Assistant</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Recent Ledger Activity */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Recent Maintenance Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audited transaction logs and payment records for your flat.
              </p>
            </div>

            <Link
              href="/maintenance/history"
              className="text-xs font-semibold text-[#315CF5] hover:underline flex items-center gap-1"
            >
              <span>Full History Table</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {history.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No maintenance records generated yet.
              </p>
            )}

            {history.slice(0, 5).map((record) => (
              <div
                key={record._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3 transition-colors hover:bg-muted/10 -mx-2 px-2 rounded-xl"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      record.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {record.status === "paid" ? "✓" : "!"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        Maintenance {record.status === "paid" ? "Settlement" : "Due"}
                      </p>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.2 rounded font-semibold ${
                          record.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Due: {formatDate(record.dueDate)} &bull; {record.paymentMethod ? `via ${record.paymentMethod.replace("_", " ")}` : "Pending Payment"}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(
                      record.status === "paid"
                        ? record.monthlyAmount
                        : record.pendingAmount
                    )}
                  </p>

                  <Link
                    href={`/maintenance/invoice/${record._id}`}
                    className="text-xs text-[#315CF5] font-medium hover:underline flex items-center gap-0.5"
                  >
                    <span>View Invoice</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}