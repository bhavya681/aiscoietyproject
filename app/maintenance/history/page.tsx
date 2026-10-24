"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowLeft, AlertCircle, FileText, Download, CheckCircle2 } from "lucide-react";

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
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="border-b border-border/60 pb-6">
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Maintenance Overview</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#315CF5] font-semibold">
                <History className="h-4 w-4" />
                <span>Audited Ledger Archive</span>
              </div>

              <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Payment History
              </h1>

              <p className="mt-1 text-sm text-muted-foreground font-mono">
                Historical record of all maintenance charges, dues, and verified receipts.
              </p>
            </div>

            {!loading && !error && (
              <div className="rounded-xl border border-border/80 bg-card px-4 py-2 text-right">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Total Settled
                </span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-muted-foreground">
            Loading ledger history...
          </div>
        ) : (
          <HistoryTable history={history} />
        )}

      </div>
    </AppShell>
  );
}
