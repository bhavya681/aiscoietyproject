"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";

import AppShell from "../../../components/layout/AppShell";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type InvoiceResponse,
  type Profile,
  type ProfileResponse,
} from "@/app/lib/types";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<InvoiceResponse | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [invoiceResult, profileResult] = await Promise.all([
          apiFetch<InvoiceResponse>(`/maintenance/invoice/${params.id}`),
          apiFetch<ProfileResponse>("/users/profile"),
        ]);

        if (!cancelled) {
          setData(invoiceResult);
          setProfile(profileResult.profile);
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
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/maintenance"
          className="no-print inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to maintenance
        </Link>

        <PageHeader
          eyebrow="Billing document"
          title="Maintenance invoice"
          description="A record of the maintenance charge issued against your flat."
          action={
            data && (
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                Print invoice
              </button>
            )
          }
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:p-8">
            <div className="h-10 w-52 animate-pulse rounded bg-muted" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-xl bg-muted/70" />
              <div className="h-24 animate-pulse rounded-xl bg-muted/70" />
            </div>
            <div className="mt-8 h-32 animate-pulse rounded-xl bg-muted/70" />
          </div>
        )}

        {data && (
          <article className="print-plain overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border/70 px-5 py-6 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-primary text-[11px] font-semibold text-primary-foreground">
                  PG
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    Palm Grove Residency
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Palm Grove Co-op Housing Society Ltd.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Maintenance invoice
                </p>
                <p className="mt-1 font-mono text-sm font-medium text-foreground">
                  {data.invoice?.invoiceNumber ?? "Generated on payment"}
                </p>
                <div className="mt-2">
                  <StatusBadge variant={isPaid ? "success" : "warning"} size="sm">
                    {data.maintenance.status}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-b border-border/70 px-5 py-6 sm:grid-cols-2 sm:px-8">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Billed to
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {profile?.name ?? "Resident"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {profile?.email ?? ""}
                </p>
                {profile?.address && (
                  <p className="mt-2 max-w-xs whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                    {profile.address}
                  </p>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:justify-items-end sm:text-right">
                <InvoiceMeta
                  label="Issued"
                  value={formatDate(
                    data.invoice?.issueDate ?? data.maintenance.createdAt
                  )}
                />
                <InvoiceMeta
                  label="Due"
                  value={formatDate(data.maintenance.dueDate)}
                />
                <InvoiceMeta
                  label="Paid"
                  value={
                    data.maintenance.paidAt
                      ? formatDate(data.maintenance.paidAt)
                      : "Not paid"
                  }
                />
                <InvoiceMeta
                  label="Method"
                  value={
                    data.maintenance.paymentMethod?.replace("_", " ") ?? "—"
                  }
                  capitalize
                />
              </dl>
            </div>

            <div className="px-5 py-6 sm:px-8">
              <div className="overflow-hidden rounded-xl border border-border/70">
                <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border/70 bg-muted/35 px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Description</span>
                  <span>Amount</span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-start gap-4 px-4 py-4">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      Residential maintenance charges
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Billing cycle due {formatDate(data.maintenance.dueDate)} ·
                      Flat tariff {formatCurrency(data.maintenance.monthlyAmount)}
                    </p>
                  </div>
                  <p className="text-[13px] font-medium text-foreground tabular-nums">
                    {formatCurrency(
                      data.invoice?.amount ?? data.maintenance.pendingAmount
                    )}
                  </p>
                </div>
              </div>

              <div className="ml-auto mt-6 max-w-xs space-y-2.5">
                <div className="flex items-center justify-between gap-6 text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground tabular-nums">
                    {formatCurrency(
                      data.invoice?.amount ?? data.maintenance.pendingAmount
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6 text-xs text-muted-foreground">
                  <span>Late fee</span>
                  <span className="text-foreground tabular-nums">₹0</span>
                </div>
                <div className="flex items-center justify-between gap-6 border-t border-border/70 pt-2.5">
                  <span className="text-xs font-medium text-foreground">
                    Total {isPaid ? "paid" : "due"}
                  </span>
                  <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                    {formatCurrency(
                      data.invoice?.amount ?? data.maintenance.pendingAmount
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/70 bg-muted/25 px-5 py-5 sm:px-8">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Maintenance charges must be paid before the 10th of the billing
                month. A late fee of ₹200 applies after the due date. This
                invoice is generated by SocietyAI for Palm Grove Co-operative
                Housing Society.
              </p>
            </div>
          </article>
        )}
      </div>
    </AppShell>
  );
}

function InvoiceMeta({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-medium text-muted-foreground">{label}</dt>
      <dd
        className={`mt-0.5 text-xs font-medium text-foreground ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
