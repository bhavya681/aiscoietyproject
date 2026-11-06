"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  History,
  LayoutDashboard,
  Receipt,
  Sparkles,
  Wrench,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import MaintenanceCard from "../components/dashboard/MaintenanceCard";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type HistoryResponse,
  type PendingResponse,
  type Profile,
  type ProfileResponse,
} from "@/app/lib/types";

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
  const firstName = profile?.name?.split(" ")[0] ?? "Resident";
  const hasPending = (pending?.totalPending ?? 0) > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-7">
        <PageHeader
          eyebrow="Resident overview"
          title={`Welcome back, ${firstName}`}
          description="A clear view of your maintenance balance, recent payments, and the fastest way to get help."
          action={
            <>
              <Link
                href="/maintenance/history"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                Payment history
              </Link>
              <Link
                href="/maintenance"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Manage dues
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          }
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
          <div className="grid divide-y divide-border/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            <Metric
              label="Pending maintenance"
              value={formatCurrency(pending?.totalPending ?? 0)}
              detail={
                pending?.nextDueDate
                  ? `Next due ${formatDate(pending.nextDueDate)}`
                  : "No due date recorded"
              }
              icon={Wrench}
              tone={hasPending ? "warning" : "success"}
              loading={loading}
            />
            <Metric
              label="Monthly base rate"
              value={formatCurrency(pending?.monthlyAmount ?? 0)}
              detail="Residential maintenance tariff"
              icon={LayoutDashboard}
              loading={loading}
            />
            <Metric
              label="Settled to date"
              value={formatCurrency(totalPaid)}
              detail={`${paidRecords.length} verified payment${
                paidRecords.length === 1 ? "" : "s"
              }`}
              icon={History}
              tone="success"
              loading={loading}
            />
            <Metric
              label="Latest receipt"
              value={
                lastPayment ? formatCurrency(lastPayment.monthlyAmount) : "—"
              }
              detail={
                lastPayment
                  ? `${formatDate(
                      lastPayment.paidAt ?? lastPayment.dueDate
                    )} · ${lastPayment.paymentMethod?.replace("_", " ") ?? "UPI"}`
                  : "No receipts issued yet"
              }
              icon={Receipt}
              loading={loading}
            />
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
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

          <section className="relative overflow-hidden rounded-2xl bg-[#101713] p-6 text-[#f3f7f4] shadow-card lg:col-span-5">
            <div className="pointer-events-none absolute inset-0 bg-app-grid text-white/[0.055]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#79c9a6] text-[#08130f]">
                  <Sparkles className="h-4.5 w-4.5" />
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#a9b7ae]">
                  Resident assistant
                </span>
              </div>

              <h2 className="mt-6 max-w-sm text-2xl font-semibold leading-tight tracking-[-0.03em]">
                Ask anything about your society.
              </h2>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#aebbb3]">
                Check balances, understand a charge, or find the right next step
                without digging through statements.
              </p>

              <div className="mt-5 space-y-2">
                {[
                  "What is my pending balance?",
                  "Show me my latest receipt.",
                  "How is maintenance calculated?",
                ].map((prompt) => (
                  <div
                    key={prompt}
                    className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[11px] text-[#c5d1c9]"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="h-3 w-3 text-[#7f8e85]" />
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <Link
                  href="/ai"
                  className="flex h-10 items-center justify-between rounded-[10px] bg-[#f3f7f4] px-4 text-xs font-medium text-[#101713] transition-colors hover:bg-white"
                >
                  Open assistant
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Recent ledger activity
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Payments and dues recorded against your flat.
              </p>
            </div>

            <Link
              href="/maintenance/history"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View full history
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!loading && history.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No ledger activity yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your maintenance records will appear here once an invoice is
                raised.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {history.slice(0, 5).map((record) => {
                const paid = record.status === "paid";

                return (
                  <div
                    key={record._id}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/25 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                          paid
                            ? "bg-emerald/10 text-emerald"
                            : "bg-amber/10 text-amber"
                        }`}
                      >
                        {paid ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Wrench className="h-4 w-4" />
                        )}
                      </span>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-medium text-foreground">
                            Maintenance {paid ? "payment" : "due"}
                          </p>
                          <StatusBadge
                            variant={paid ? "success" : "warning"}
                            size="sm"
                          >
                            {record.status}
                          </StatusBadge>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Due {formatDate(record.dueDate)}
                          {record.paymentMethod
                            ? ` · ${record.paymentMethod.replace("_", " ")}`
                            : " · Awaiting payment"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 pl-[50px] sm:justify-end sm:pl-0">
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        {formatCurrency(
                          paid ? record.monthlyAmount : record.pendingAmount
                        )}
                      </p>
                      <Link
                        href={`/maintenance/invoice/${record._id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Invoice
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default",
  loading,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning";
  loading?: boolean;
}) {
  const iconClasses = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald/10 text-emerald",
    warning: "bg-amber/10 text-amber",
  }[tone];

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-[23px] font-semibold tracking-[-0.03em] text-foreground tabular-nums">
            {loading ? "—" : value}
          </p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${iconClasses}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 truncate text-[11px] text-muted-foreground">
        {loading ? "Loading account details..." : detail}
      </p>
    </div>
  );
}
