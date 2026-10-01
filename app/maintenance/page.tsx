"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "../components/layout/AppShell";
import { apiFetch, ApiError } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type PaymentResponse,
  type PendingResponse,
} from "@/app/lib/types";

const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

/** Fetches the resident's outstanding maintenance. */
async function fetchPending(): Promise<PendingResponse> {
  return apiFetch<PendingResponse>("/maintenance/pending");
}

export default function MaintenancePage() {
  const [data, setData] = useState<PendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pending = await fetchPending();

        if (cancelled) {
          return;
        }

        setData(pending);
        setError("");
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load maintenance."
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

  async function handlePay(maintenanceId: string, amount: number) {
    const confirmed = window.confirm(
      `Pay ${formatCurrency(amount)} for this maintenance via ${
        PAYMENT_METHODS.find((option) => option.value === method)?.label
      }?\n\nThis records a payment against your account.`
    );

    if (!confirmed) {
      return;
    }

    setPaying(true);
    setError("");
    setNotice("");

    try {
      const result = await apiFetch<PaymentResponse>(
        `/maintenance/pay/${maintenanceId}`,
        {
          method: "POST",
          // `confirmation: true` is the application-level gate: the API will
          // refuse to move money without it.
          body: { paymentMethod: method, confirmation: true },
        }
      );

      setNotice(
        `Payment of ${formatCurrency(
          result.amount
        )} recorded. Transaction ${result.transactionId}.`
      );

      setData(await fetchPending());
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "The payment could not be recorded."
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm text-zinc-500">Payments</p>

          <h1 className="mt-1 text-3xl font-bold">Maintenance</h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage your society maintenance payments.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Pending maintenance</p>

                  <p className="mt-2 text-4xl font-bold">
                    {loading ? "—" : formatCurrency(data?.totalPending ?? 0)}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {data?.nextDueDate
                      ? `Next due ${formatDate(data.nextDueDate)}`
                      : "Nothing pending"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    (data?.totalPending ?? 0) > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {(data?.totalPending ?? 0) > 0 ? "Pending" : "All paid"}
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Info
                  label="Monthly amount"
                  value={formatCurrency(data?.monthlyAmount ?? 0)}
                />
                <Info
                  label="Pending amount"
                  value={formatCurrency(data?.totalPending ?? 0)}
                />
                <Info
                  label="Due date"
                  value={formatDate(data?.nextDueDate)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="font-semibold">Unpaid records</h2>

              {loading ? (
                <p className="mt-4 text-sm text-zinc-500">Loading...</p>
              ) : data && data.maintenance.length > 0 ? (
                <ul className="mt-4 divide-y divide-zinc-100">
                  {data.maintenance.map((record) => (
                    <li
                      key={record._id}
                      className="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {formatCurrency(record.pendingAmount)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Due {formatDate(record.dueDate)} ·{" "}
                          <span className="capitalize">{record.status}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/maintenance/invoice/${record._id}`}
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                          Invoice
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handlePay(record._id, record.pendingAmount)
                          }
                          disabled={paying || record.pendingAmount <= 0}
                          className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {paying ? "Processing..." : "Pay"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">
                  You have no unpaid maintenance.
                </p>
              )}
            </div>

            <Link
              href="/maintenance/history"
              className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
            >
              Payment History
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-medium text-zinc-500">
                Payment method
              </p>

              <div className="mt-4 space-y-2">
                {PAYMENT_METHODS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-sm transition hover:bg-zinc-50"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={method === option.value}
                      onChange={() => setMethod(option.value)}
                      className="accent-zinc-900"
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                The selected method is used when you pay a record.
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-600 p-6 text-white">
              <p className="text-sm font-medium text-indigo-200">
                Payment information
              </p>

              <h2 className="mt-3 text-xl font-bold">Need to know something?</h2>

              <p className="mt-3 text-sm leading-6 text-indigo-100">
                Ask the AI assistant about payment methods, late fees or society
                maintenance policies.
              </p>

              <Link
                href="/ai"
                className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700"
              >
                Ask AI →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
