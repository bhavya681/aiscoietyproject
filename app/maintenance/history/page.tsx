"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowLeft, AlertCircle } from "lucide-react";

import AppShell from "../../components/layout/AppShell";
import HistoryTable from "../../components/maintenance/HistoryTable";
import { apiFetch } from "@/app/lib/api";
import { formatCurrency, type HistoryResponse } from "@/app/lib/types";

export default function MaintenanceHistoryPage() {
  const [history, setHistory] = useState<HistoryResponse["history"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<HistoryResponse>(
          "/maintenance/history"
        );

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

  const totalPaid = history
    .filter((record) => record.status === "paid")
    .reduce((total, record) => total + record.monthlyAmount, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Maintenance</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <History className="h-4 w-4" />
            <span>Transaction Ledger</span>
          </div>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Payment History
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Complete historical record of all maintenance charges, dues, and verified payments.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Settled Maintenance
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading your payment history...
          </div>
        ) : (
          <HistoryTable history={history} />
        )}
      </div>
    </AppShell>
  );
}

