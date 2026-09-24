"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaintenance() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/maintenance/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setMaintenance(data.data ?? data.maintenance);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchMaintenance();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-slate-500">Payments</p>

        <h1 className="mt-1 text-3xl font-bold">
          Maintenance
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your society maintenance payments.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Pending maintenance
              </p>

              <p className="mt-2 text-4xl font-bold">
                ₹{maintenance?.pendingAmount ?? 4000}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Due on {maintenance?.dueDate ?? "10th of every month"}
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
              Pending
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Info label="Monthly amount" value="₹4,000" />
            <Info label="Pending amount" value="₹4,000" />
            <Info label="Due date" value="10th" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Pay Maintenance
            </button>

            <Link
              href="/maintenance/history"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Payment History
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-indigo-600 p-6 text-white">
          <p className="text-sm font-medium text-indigo-200">
            Payment information
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Need to know something?
          </h2>

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
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}