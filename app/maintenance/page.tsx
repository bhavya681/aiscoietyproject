"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building,
  Receipt,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import { apiFetch, ApiError } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type PaymentResponse,
  type PendingResponse,
} from "@/app/lib/types";

const PAYMENT_METHODS = [
  { value: "upi", label: "UPI / QR Code", desc: "Instant settlement via Google Pay, PhonePe, Paytm" },
  { value: "bank_transfer", label: "NEFT / RTGS Bank Transfer", desc: "Direct IMPS / NEFT transfer to Society account" },
  { value: "cash", label: "Society Office Cash Counter", desc: "Pay in person with immediate manual voucher" },
  { value: "other", label: "Cheque / DD", desc: "Demand Draft or Society Cheque submission" },
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

  async function handlePay(maintenanceId: string, amount: number) {
    const selectedMethodLabel = PAYMENT_METHODS.find((option) => option.value === method)?.label;
    const confirmed = window.confirm(
      `Record payment of ${formatCurrency(amount)} via ${selectedMethodLabel}?\n\nThis will instantly update your ledger and generate an official receipt.`
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
        )} successfully recorded. Transaction ID: ${result.transactionId}`
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
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#315CF5] font-semibold">
                Financial Operations &bull; Dues &amp; Billing
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Maintenance Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              Track society dues, submit payments, and access audited GST invoices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/maintenance/history"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition"
            >
              <span>View Past Receipts</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Financial Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Balance Card & Outstanding Records */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary Balance Summary Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Total Outstanding Balance
                  </span>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
                      {formatCurrency(data?.totalPending ?? 0)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ${
                        isPending
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-amber-500" : "bg-emerald-500"}`} />
                      {isPending ? "Dues Active" : "No Outstanding Dues"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Standard Monthly</span>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {formatCurrency(data?.monthlyAmount ?? 0)}
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-border/60" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                  <span className="font-mono text-muted-foreground uppercase">Next Due Date</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {data?.nextDueDate ? formatDate(data.nextDueDate) : "No pending due date"}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                  <span className="font-mono text-muted-foreground uppercase">Compliance Status</span>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Audited Resident Profile
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Pending Invoices Breakdown */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    Pending Invoices &amp; Charges
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select a cycle to record payment.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted">
                  {data?.maintenance?.length ?? 0} Pending
                </span>
              </div>

              <div className="mt-4 divide-y divide-border/60">
                {!data?.maintenance?.length && (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      You are all caught up!
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No pending maintenance charges for your residence.
                    </p>
                  </div>
                )}

                {data?.maintenance?.map((record: any) => (
                  <div
                    key={record._id}
                    className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-muted/10 -mx-2 px-2 rounded-xl"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          Maintenance Fee ({formatDate(record.dueDate)})
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">
                          Due
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Base: {formatCurrency(record.monthlyAmount)} &bull; Outstanding: {formatCurrency(record.pendingAmount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/maintenance/invoice/${record._id}`}
                        className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                      >
                        View Invoice
                      </Link>

                      <button
                        type="button"
                        onClick={() => handlePay(record._id, record.pendingAmount)}
                        disabled={paying}
                        className="rounded-xl bg-[#315CF5] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2549d4] transition disabled:opacity-50"
                      >
                        {paying ? "Processing..." : `Pay ${formatCurrency(record.pendingAmount)}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Payment Method Selection & Bank Details */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-[#315CF5] font-semibold">
                Settlement Channel
              </span>
              <h3 className="mt-1 text-lg font-bold text-foreground">
                Payment Method
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose your preferred mode for this transaction.
              </p>

              <div className="mt-5 space-y-2.5">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      method === pm.value
                        ? "border-[#315CF5] bg-[#315CF5]/5 text-foreground"
                        : "border-border/60 hover:bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={pm.value}
                      checked={method === pm.value}
                      onChange={() => setMethod(pm.value)}
                      className="mt-1 text-[#315CF5] focus:ring-[#315CF5]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {pm.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                        {pm.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-muted-foreground space-y-1">
                <p>✓ Instant official invoice generation</p>
                <p>✓ Bank-audited reconciliation</p>
                <p>✓ Society treasurer notification</p>
              </div>
            </div>

            {/* Society Bank Details Card */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 text-xs font-mono space-y-2">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Direct Transfer Details:
              </span>
              <p className="text-foreground font-semibold font-sans">Palm Grove Co-op Housing Society Ltd.</p>
              <div className="divide-y divide-border/40 text-muted-foreground">
                <div className="py-1 flex justify-between">
                  <span>A/C No:</span>
                  <span className="text-foreground">50200049281921</span>
                </div>
                <div className="py-1 flex justify-between">
                  <span>IFSC:</span>
                  <span className="text-foreground">HDFC0001284</span>
                </div>
                <div className="py-1 flex justify-between">
                  <span>Branch:</span>
                  <span className="text-foreground">Bandra West, Mumbai</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
