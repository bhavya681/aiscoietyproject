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
  const societyName = profile?.activeSociety?.name ?? null;
  const hasPending = (pending?.totalPending ?? 0) > 0;

  return (
    <AppShell>
      <div className="w-full space-y-6 lg:space-y-8">
        <PageHeader
          eyebrow="Resident overview"
          title={`Welcome back, ${firstName}`}
          description={
            societyName
              ? `Your maintenance, payments and help for ${societyName}.`
              : "A clear view of your maintenance balance, recent payments, and the fastest way to get help."
          }
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

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Pending maintenance"
            value={formatCurrency(pending?.totalPending ?? 0)}
            detail={
              pending?.nextDueDate
                ? `Next due ${formatDate(pending.nextDueDate)}`
                : "No due date recorded"
            }
            tone={hasPending ? "warning" : "success"}
            loading={loading}
          />
          <Metric
            label="Monthly base rate"
            value={formatCurrency(pending?.monthlyAmount ?? 0)}
            detail="Residential maintenance tariff"
            loading={loading}
          />
          <Metric
            label="Settled to date"
            value={formatCurrency(totalPaid)}
            detail={`${paidRecords.length} verified payment${
              paidRecords.length === 1 ? "" : "s"
            }`}
            tone="success"
            loading={loading}
          />
          <Metric
            label="Latest receipt"
            value={lastPayment ? formatCurrency(lastPayment.monthlyAmount) : "—"}
            detail={
              lastPayment
                ? `${formatDate(
                    lastPayment.paidAt ?? lastPayment.dueDate
                  )} · ${lastPayment.paymentMethod?.replace("_", " ") ?? "UPI"}`
                : "No receipts issued yet"
            }
            loading={loading}
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
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

          <section className="relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-card xl:col-span-5">
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-md bg-accent px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-accent-foreground">
                Resident assistant
              </span>
            </div>

            <h2 className="mt-5 max-w-sm text-2xl font-semibold leading-tight tracking-[-0.03em] text-foreground">
              Ask anything about your society.
            </h2>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Check balances, understand a charge, or find the right next step
              without digging through statements.
            </p>

            <div className="mt-5 space-y-2">
              {[
                "What is my pending balance?",
                "Show me my latest receipt.",
                "How is maintenance calculated?",
              ].map((prompt) => (
                <Link
                  key={prompt}
                  href="/ai"
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span>{prompt}</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6">
              <Link
                href="/ai"
                className="flex h-10 items-center justify-between rounded-[10px] bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open assistant
                <ArrowRight className="h-4 w-4" />
              </Link>
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
                    <div className="min-w-0">
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

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
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
  tone = "default",
  loading,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning";
  loading?: boolean;
}) {
  const dotClasses = {
    default: "bg-muted-foreground/40",
    success: "bg-emerald",
    warning: "bg-amber",
  }[tone];

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClasses}`} />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2.5 truncate text-[23px] font-semibold tracking-[-0.03em] text-foreground tabular-nums">
        {loading ? "—" : value}
      </p>
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
        {loading ? "Loading account details..." : detail}
      </p>
    </div>
  );
}
