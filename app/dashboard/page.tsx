"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-500">Overview</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {loading ? "Welcome back" : `Welcome back, ${user?.name}`}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's what's happening with your society account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          title="Pending Maintenance"
          value="₹4,000"
          subtitle="Due on 10th"
          icon="₹"
        />

        <DashboardStat
          title="This Month"
          value="₹4,000"
          subtitle="Maintenance"
          icon="◷"
        />

        <DashboardStat
          title="Total Paid"
          value="₹12,000"
          subtitle="This year"
          icon="✓"
        />

        <DashboardStat
          title="Account"
          value="Active"
          subtitle="All services available"
          icon="●"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Maintenance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">
                Maintenance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current maintenance status
              </p>
            </div>

            <Link
              href="/maintenance"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View details →
            </Link>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending amount</p>

                <p className="mt-1 text-3xl font-bold">₹4,000</p>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                Pending
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-2/3 rounded-full bg-indigo-600" />
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Current cycle</span>
              <span>Due 10th</span>
            </div>
          </div>
        </div>

        {/* AI */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 font-bold">
            AI
          </div>

          <h2 className="mt-5 text-xl font-bold">
            Need help?
          </h2>

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

      {/* Recent activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-500">
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

        <div className="mt-6 divide-y divide-slate-100">
          <Activity
            title="Maintenance invoice generated"
            date="Today"
            amount="₹4,000"
          />

          <Activity
            title="Previous maintenance payment"
            date="Aug 10"
            amount="₹4,000"
          />

          <Activity
            title="Maintenance payment"
            date="Jul 10"
            amount="₹4,000"
          />
        </div>
      </div>
    </div>
  );
}

function DashboardStat({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <span className="text-sm font-bold text-indigo-600">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function Activity({
  title,
  date,
  amount,
}: {
  title: string;
  date: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600">
          ✓
        </div>

        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-slate-500">{date}</p>
        </div>
      </div>

      <p className="text-sm font-semibold">{amount}</p>
    </div>
  );
}