"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "../components/layout/AppShell";
import MaintenanceCard from "../components/dashboard/MaintenanceCard";
import StatCard from "../components/dashboard/StatCard";
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

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm text-zinc-500">Overview</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            {loading
              ? "Welcome back"
              : `Welcome back, ${profile?.name ?? "Resident"}`}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {profile
              ? `${profile.email} · ${profile.role === "admin" ? "Admin" : "Resident"}`
              : "Here's what's happening with your society account."}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Maintenance"
            value={formatCurrency(pending?.totalPending ?? 0)}
            description={
              pending?.nextDueDate
                ? `Due ${formatDate(pending.nextDueDate)}`
                : "Nothing due"
            }
            icon="₹"
          />

          <StatCard
            title="Monthly Amount"
            value={formatCurrency(pending?.monthlyAmount ?? 0)}
            description="Per flat, per month"
            icon="◷"
          />

          <StatCard
            title="Total Paid"
            value={formatCurrency(totalPaid)}
            description={`${paidRecords.length} payment${paidRecords.length === 1 ? "" : "s"} recorded`}
            icon="✓"
          />

          <StatCard
            title="Last Payment"
            value={lastPayment ? formatCurrency(lastPayment.monthlyAmount) : "—"}
            description={
              lastPayment
                ? `${formatDate(lastPayment.paidAt ?? lastPayment.dueDate)} via ${
                    lastPayment.paymentMethod?.replace("_", " ") ?? "—"
                  }`
                : "No payments yet"
            }
            icon="●"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
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

          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 font-bold">
              AI
            </div>

            <h2 className="mt-5 text-xl font-bold">Need help?</h2>

            <p className="mt-2 text-sm leading-6 text-indigo-100">
              Ask SocietyAI about your maintenance, payments, invoices or
              society policies.
            </p>

            <Link
              href="/ai"
              className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              Open Assistant →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Recent Activity</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Your latest maintenance activity
              </p>
            </div>

            <Link
              href="/maintenance/history"
              className="text-sm font-semibold text-indigo-600"
            >
              View history →
            </Link>
          </div>

          <div className="mt-6 divide-y divide-zinc-100">
            {history.length === 0 && (
              <p className="py-4 text-sm text-zinc-500">
                No maintenance records yet.
              </p>
            )}

            {history.slice(0, 5).map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600">
                    {record.status === "paid" ? "✓" : "!"}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Maintenance{" "}
                      {record.status === "paid" ? "payment" : "due"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Due {formatDate(record.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(
                      record.status === "paid"
                        ? record.monthlyAmount
                        : record.pendingAmount
                    )}
                  </p>

                  <Link
                    href={`/maintenance/invoice/${record._id}`}
                    className="text-xs text-indigo-600"
                  >
                    View invoice
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
