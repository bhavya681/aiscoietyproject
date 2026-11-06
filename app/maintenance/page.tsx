"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  FileText,
  Landmark,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch, ApiError } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type MaintenanceRecord,
  type PaymentResponse,
  type PendingResponse,
} from "@/app/lib/types";

const PAYMENT_METHODS = [
  {
    value: "upi",
    label: "UPI or QR code",
    desc: "Google Pay, PhonePe, Paytm",
    icon: Smartphone,
  },
  {
    value: "bank_transfer",
    label: "NEFT or RTGS",
    desc: "Direct transfer to the society account",
    icon: Landmark,
  },
  {
    value: "cash",
    label: "Society office",
    desc: "Pay in person with a manual voucher",
    icon: Banknote,
  },
  {
    value: "other",
    label: "Cheque or demand draft",
    desc: "Submit a cheque at the society office",
    icon: FileText,
  },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

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
  const [paymentToConfirm, setPaymentToConfirm] = useState<{
    id: string;
    amount: number;
  } | null>(null);

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
              : "Could not load maintenance information."
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

  async function confirmPayment() {
    if (!paymentToConfirm) {
      return;
    }

    setPaying(true);
    setError("");
    setNotice("");

    try {
      const result = await apiFetch<PaymentResponse>(
        `/maintenance/pay/${paymentToConfirm.id}`,
        {
          method: "POST",
          body: { paymentMethod: method, confirmation: true },
        }
      );

      setNotice(
        `Payment of ${formatCurrency(
          result.amount
        )} recorded. Transaction ID: ${result.transactionId}`
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
      setPaymentToConfirm(null);
    }
  }

  const isPending = (data?.totalPending ?? 0) > 0;
  const selectedMethod =
    PAYMENT_METHODS.find((option) => option.value === method) ??
    PAYMENT_METHODS[0];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-7">
        <PageHeader
          eyebrow="Billing and payments"
          title="Maintenance"
          description="Review your outstanding dues, record a payment, and keep a clean record of every billing cycle."
          action={
            <Link
              href="/maintenance/history"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Payment history
            </Link>
          }
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald/20 bg-emerald/[0.07] px-4 py-3 text-sm text-emerald">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Total outstanding balance
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    <p className="text-[38px] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">
                      {loading ? "—" : formatCurrency(data?.totalPending ?? 0)}
                    </p>
                    <StatusBadge variant={isPending ? "warning" : "success"} size="sm">
                      {isPending ? "Dues active" : "All clear"}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {isPending
                      ? "Settle your balance before the due date to avoid late fees."
                      : "There are no outstanding maintenance charges."}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/55 px-4 py-3 text-right">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Standard monthly
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground tabular-nums">
                    {formatCurrency(data?.monthlyAmount ?? 0)}
                  </p>
                </div>
              </div>

              <div className="my-5 h-px bg-border/70" />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-border/70 px-3.5 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Next due date</p>
                    <p className="mt-0.5 text-[13px] font-medium text-foreground">
                      {data?.nextDueDate
                        ? formatDate(data.nextDueDate)
                        : "No pending due date"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/70 px-3.5 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Account standing</p>
                    <p className="mt-0.5 text-[13px] font-medium text-foreground">
                      Audited resident profile
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
                <div>
                  <h2 className="text-sm font-medium text-foreground">
                    Pending invoices
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Select a billing cycle to record payment.
                  </p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  {data?.maintenance?.length ?? 0} pending
                </span>
              </div>

              {!loading && !data?.maintenance?.length ? (
                <div className="px-5 py-12 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    You are all caught up
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No pending maintenance charges for your residence.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {data?.maintenance?.map((record: MaintenanceRecord) => (
                    <div
                      key={record._id}
                      className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/25 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-medium text-foreground">
                            Maintenance fee
                          </p>
                          <StatusBadge variant="warning" size="sm">
                            Due
                          </StatusBadge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDate(record.dueDate)} · Base{" "}
                          {formatCurrency(record.monthlyAmount)} · Outstanding{" "}
                          {formatCurrency(record.pendingAmount)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/maintenance/invoice/${record._id}`}
                          className="inline-flex h-9 items-center rounded-[9px] border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          View invoice
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setPaymentToConfirm({
                              id: record._id,
                              amount: record.pendingAmount,
                            })
                          }
                          disabled={paying}
                          className="inline-flex h-9 items-center rounded-[9px] bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          Pay {formatCurrency(record.pendingAmount)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5 lg:col-span-5">
            <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
              <h2 className="text-sm font-medium text-foreground">
                Payment method
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose how you want this payment recorded.
              </p>

              <div className="mt-4 space-y-2">
                {PAYMENT_METHODS.map((option) => {
                  const Icon = option.icon;
                  const active = method === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                        active
                          ? "border-primary/30 bg-accent"
                          : "border-border/70 hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={option.value}
                        checked={active}
                        onChange={() => setMethod(option.value)}
                        className="sr-only"
                      />

                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-foreground">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                          {option.desc}
                        </span>
                      </span>

                      <span
                        className={`mt-2 h-3.5 w-3.5 shrink-0 rounded-full border ${
                          active
                            ? "border-primary bg-primary ring-2 ring-primary/15 ring-inset"
                            : "border-input"
                        }`}
                      />
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/70 pt-4">
                {[
                  "Instant invoice generation",
                  "Bank-audited reconciliation",
                  "Treasurer notification",
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-2 text-[11px] text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
                    {item}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 bg-muted/35 p-5">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-xs font-medium text-foreground">
                  Direct transfer details
                </h2>
              </div>

              <p className="mt-3 text-[13px] font-medium text-foreground">
                Palm Grove Co-op Housing Society Ltd.
              </p>

              <div className="mt-2 divide-y divide-border/70 text-[11px]">
                <DetailRow label="Account number" value="50200049281921" />
                <DetailRow label="IFSC" value="HDFC0001284" />
                <DetailRow label="Branch" value="Bandra West, Mumbai" />
              </div>
            </section>
          </div>
        </div>
      </div>

      {paymentToConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
            onClick={() => !paying && setPaymentToConfirm(null)}
            aria-hidden
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-dialog-title"
            className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setPaymentToConfirm(null)}
              disabled={paying}
              aria-label="Close"
              className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-accent text-accent-foreground">
              <Wallet className="h-4.5 w-4.5" />
            </span>

            <h2
              id="payment-dialog-title"
              className="mt-4 text-lg font-semibold tracking-tight text-foreground"
            >
              Confirm payment
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This records the payment immediately and generates an official
              receipt for your account.
            </p>

            <dl className="mt-4 space-y-2 rounded-xl bg-muted/55 p-3.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(paymentToConfirm.amount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Method</dt>
                <dd className="font-medium text-foreground">
                  {selectedMethod.label}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Society</dt>
                <dd className="text-right font-medium text-foreground">
                  Palm Grove Residency
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentToConfirm(null)}
                disabled={paying}
                className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPayment}
                disabled={paying}
                className="flex h-10 flex-[1.4] items-center justify-center gap-2 rounded-[10px] bg-primary text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {paying ? "Recording payment..." : "Confirm payment"}
                {!paying && <ArrowUpRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
