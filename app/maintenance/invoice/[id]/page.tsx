"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, AlertCircle, Building2 } from "lucide-react";

import AppShell from "../../../components/layout/AppShell";
import { apiFetch } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type InvoiceResponse,
} from "@/app/lib/types";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await apiFetch<InvoiceResponse>(
          `/maintenance/invoice/${params.id}`
        );

        if (!cancelled) {
          setData(result);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load this invoice."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const isPaid = data?.maintenance.status === "paid";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Maintenance</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <FileText className="h-4 w-4" />
            <span>Official Invoice Document</span>
          </div>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Maintenance Invoice
          </h1>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading invoice details...
          </div>
        )}

        {data && (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    SocietyAI Billing
                  </p>
                  <p className="text-base font-bold text-foreground">
                    Maintenance Invoice
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  isPaid
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPaid ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {data.maintenance.status}
              </span>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <Row
                label="Invoice Number"
                value={data.invoice?.invoiceNumber ?? "Generated upon payment"}
              />
              <Row
                label="Maintenance Reference"
                value={data.maintenance._id}
                mono
              />
              <Row
                label="Billed Amount"
                value={formatCurrency(
                  data.invoice?.amount ?? data.maintenance.pendingAmount
                )}
              />
              <Row
                label="Issue Date"
                value={formatDate(
                  data.invoice?.issueDate ?? data.maintenance.createdAt
                )}
              />
              <Row label="Due Date" value={formatDate(data.maintenance.dueDate)} />
              <Row
                label="Paid Date"
                value={formatDate(data.maintenance.paidAt)}
              />
              <Row
                label="Payment Method"
                value={
                  data.maintenance.paymentMethod?.replace("_", " ") ?? "-"
                }
              />
              <Row
                label="Monthly Rate"
                value={formatCurrency(data.maintenance.monthlyAmount)}
              />
            </dl>

            <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Policy Notice: </span>
              Society maintenance charges must be remitted before the 10th of every month. A late payment fee
              of ₹200 automatically accrues past the due window.
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>

      <dd
        className={`mt-1 text-sm text-foreground ${
          mono ? "font-mono text-xs text-muted-foreground break-all" : "font-bold"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

