"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, AlertCircle, CheckCircle2, Clock, ArrowRight, ShieldCheck, FileText } from "lucide-react";

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

  const isPending = (data?.totalPending ?? 0) > 0;

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <CreditCard className="h-4 w-4" />
            <span>Payments & Dues</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Maintenance
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track society dues, submit payments, and download official invoices.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Balance Overview Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total Pending Dues
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">
                    {loading ? "—" : formatCurrency(data?.totalPending ?? 0)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {data?.nextDueDate
                        ? `Next due date: ${formatDate(data.nextDueDate)}`
                        : "All dues currently settled"}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                    isPending
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPending ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  {isPending ? "Pending Action" : "All Paid"}
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Info
                  label="Monthly Base Charge"
                  value={formatCurrency(data?.monthlyAmount ?? 0)}
                />
                <Info
                  label="Pending Amount"
                  value={formatCurrency(data?.totalPending ?? 0)}
                />
                <Info
                  label="Next Due Date"
                  value={formatDate(data?.nextDueDate)}
                />
              </div>
            </div>

            {/* Unpaid Records */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-base font-bold text-foreground">
                  Unpaid Invoices & Records
                </h2>
                <span className="text-xs text-muted-foreground">
                  {data?.maintenance?.length ?? 0} record(s)
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Loading records...
                </div>
              ) : data && data.maintenance.length > 0 ? (
                <ul className="divide-y divide-border">
                  {data.maintenance.map((record) => (
                    <li
                      key={record._id}
                      className="flex flex-wrap items-center justify-between gap-4 py-4 transition-colors hover:bg-muted/40 px-2 rounded-xl"
                    >
                      <div>
                        <p className="text-base font-bold text-foreground">
                          {formatCurrency(record.pendingAmount)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Due {formatDate(record.dueDate)} ·{" "}
                          <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-500">
                            {record.status}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/maintenance/invoice/${record._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground shadow-xs"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Invoice</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handlePay(record._id, record.pendingAmount)
                          }
                          disabled={paying || record.pendingAmount <= 0}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 shadow-xs"
                        >
                          {paying ? "Processing..." : "Pay Now"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No outstanding maintenance
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Great job! You have cleared all pending society dues.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Link
                href="/maintenance/history"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground shadow-xs"
              >
                <span>View Full Payment History</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right sidebar options */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Channel
              </p>
              <h3 className="mt-1 text-sm font-bold text-foreground">
                Select Payment Mode
              </h3>

              <div className="mt-4 space-y-2.5">
                {PAYMENT_METHODS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-sm font-medium transition ${
                      method === option.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={method === option.value}
                        onChange={() => setMethod(option.value)}
                        className="accent-primary h-4 w-4"
                      />
                      <span>{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                The chosen method will be saved with your transaction record.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <span>AI Powered Advice</span>
              </div>

              <h2 className="mt-2 text-lg font-bold text-foreground">
                Have questions regarding maintenance fees?
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Ask SocietyAI to verify charges, breakdown your bills, explain penalties, or clarify policy details.
              </p>

              <Link
                href="/ai"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 shadow-sm"
              >
                <span>Ask SocietyAI</span>
                <ArrowRight className="h-3.5 w-3.5" />
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
    <div className="rounded-xl border border-border/60 bg-muted/50 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
