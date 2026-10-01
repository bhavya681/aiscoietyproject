"use client";

import { useEffect, useState } from "react";

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
      <div className="space-y-8">
        <div>
          <p className="text-sm text-zinc-500">Payments</p>

          <h1 className="mt-1 text-3xl font-bold">Payment History</h1>

          <p className="mt-2 text-sm text-zinc-500">
            Every maintenance record on your account.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Total paid to date</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Loading your history...</p>
        ) : (
          <HistoryTable history={history} />
        )}
      </div>
    </AppShell>
  );
}
