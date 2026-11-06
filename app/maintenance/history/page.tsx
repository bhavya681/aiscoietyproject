"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Receipt,
} from "lucide-react";

import AppShell from "../../components/layout/AppShell";
import HistoryTable from "../../components/maintenance/HistoryTable";
import PageHeader from "@/app/components/ui/PageHeader";
import { apiFetch } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type HistoryResponse,
} from "@/app/lib/types";

export default function MaintenanceHistoryPage() {
  const [history, setHistory] = useState<HistoryResponse["history"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<HistoryResponse>("/maintenance/history");

        if (!cancelled) {
          setHistory(data.history);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load your history."
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
  const totalOutstanding = history
    .filter((record) => record.status !== "paid")
    .reduce((total, record) => total + record.pendingAmount, 0);
  const latestPayment = paidRecords[0] ?? null;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-7">
        <Link
          href="/maintenance"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to maintenance
        </Link>

        <PageHeader
          eyebrow="Ledger archive"
          title="Payment history"
          description="Every maintenance charge, payment, and receipt recorded against your flat."
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
            <div className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <Summary
                label="Total settled"
                value={formatCurrency(totalPaid)}
                detail={`${paidRecords.length} verified payment${
                  paidRecords.length === 1 ? "" : "s"
                }`}
                icon={CheckCircle2}
                tone="success"
              />
              <Summary
                label="Outstanding"
                value={formatCurrency(totalOutstanding)}
                detail={
                  totalOutstanding > 0
                    ? "Requires attention"
                    : "No pending balance"
                }
                icon={Receipt}
                tone={totalOutstanding > 0 ? "warning" : "default"}
              />
              <Summary
                label="Latest payment"
                value={
                  latestPayment
                    ? formatCurrency(latestPayment.monthlyAmount)
                    : "—"
                }
                detail={
                  latestPayment
                    ? formatDate(latestPayment.paidAt ?? latestPayment.dueDate)
                    : "No payments recorded"
                }
                icon={FileText}
                tone="default"
              />
            </div>
          </section>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-muted/70"
                />
              ))}
            </div>
          </div>
        ) : (
          <HistoryTable history={history} />
        )}
      </div>
    </AppShell>
  );
}

function Summary({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "success" | "warning";
}) {
  const classes = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald/10 text-emerald",
    warning: "bg-amber/10 text-amber",
  }[tone];

  return (
    <div className="flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-[23px] font-semibold tracking-[-0.03em] text-foreground tabular-nums">
          {value}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
      </div>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${classes}`}
      >
        <Icon className="h-4 w-4" />
      </span>
    </div>
  );
}
