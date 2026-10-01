"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/maintenance"
            className="text-sm font-semibold text-indigo-600"
          >
            ← Back to maintenance
          </Link>

          <h1 className="mt-3 text-3xl font-bold">Invoice</h1>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && <p className="text-sm text-zinc-500">Loading invoice...</p>}

        {data && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-6">
              <div>
                <p className="text-sm text-zinc-500">SocietyAI</p>
                <p className="mt-1 text-lg font-semibold">Maintenance Invoice</p>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                  data.maintenance.status === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {data.maintenance.status}
              </span>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <Row
                label="Invoice number"
                value={data.invoice?.invoiceNumber ?? "Not issued yet"}
              />
              <Row
                label="Maintenance reference"
                value={data.maintenance._id}
                mono
              />
              <Row
                label="Amount"
                value={formatCurrency(
                  data.invoice?.amount ?? data.maintenance.pendingAmount
                )}
              />
              <Row
                label="Issue date"
                value={formatDate(
                  data.invoice?.issueDate ?? data.maintenance.createdAt
                )}
              />
              <Row label="Due date" value={formatDate(data.maintenance.dueDate)} />
              <Row
                label="Paid on"
                value={formatDate(data.maintenance.paidAt)}
              />
              <Row
                label="Payment method"
                value={
                  data.maintenance.paymentMethod?.replace("_", " ") ?? "-"
                }
              />
              <Row label="Monthly amount" value={formatCurrency(data.maintenance.monthlyAmount)} />
            </dl>

            <p className="mt-8 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
              Maintenance must be paid before the 10th of every month. A late fee
              of ₹200 applies after that date.
            </p>
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
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </dt>

      <dd
        className={`mt-1 text-sm text-zinc-900 ${
          mono ? "font-mono text-xs" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
