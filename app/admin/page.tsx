"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type MaintenanceRecord,
  type Profile,
} from "@/app/lib/types";

type AdminUser = Profile;

type PopulatedMaintenance = Omit<MaintenanceRecord, "userId"> & {
  userId: { _id: string; name: string; email: string } | null;
};

const INPUT_CLASS =
  "h-10 w-full rounded-[10px] border border-input bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

async function fetchAdminData() {
  const [userData, maintenanceData] = await Promise.all([
    apiFetch<{ users: AdminUser[] }>("/admin/users"),
    apiFetch<{ maintenance: PopulatedMaintenance[] }>("/admin/maintenance"),
  ]);

  return { users: userData.users, maintenance: maintenanceData.maintenance };
}

function statusVariant(status: MaintenanceRecord["status"]) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "overdue") {
    return "danger" as const;
  }

  return "warning" as const;
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [maintenance, setMaintenance] = useState<PopulatedMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [residentId, setResidentId] = useState("");
  const [amount, setAmount] = useState("4000");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchAdminData();

        if (cancelled) {
          return;
        }

        setUsers(data.users);
        setMaintenance(data.maintenance);
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load admin data."
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

  async function refresh() {
    setRefreshing(true);

    try {
      const data = await fetchAdminData();

      setUsers(data.users);
      setMaintenance(data.maintenance);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not refresh data."
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreateMaintenance(event: React.FormEvent) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/admin/maintenance", {
        method: "POST",
        body: {
          userId: residentId,
          amount: Number(amount),
          dueDate,
        },
      });

      setNotice("Maintenance record created.");
      setResidentId("");
      setDueDate("");

      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not create the maintenance record."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setError("");
    setNotice("");

    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: { role },
      });

      setNotice("Role updated.");
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update the role."
      );
    }
  }

  async function handleDeleteUser(userId: string, name: string) {
    if (!window.confirm(`Delete ${name} and all of their records?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });

      setNotice("User deleted.");
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not delete the user."
      );
    }
  }

  const totalOutstanding = maintenance
    .filter((record) => record.status !== "paid")
    .reduce((total, record) => total + record.pendingAmount, 0);
  const openRecords = maintenance.filter(
    (record) => record.status !== "paid"
  ).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-7">
        <PageHeader
          eyebrow="Society administration"
          title="Admin panel"
          description="Manage residents, raise maintenance charges, and keep the society ledger accurate."
          action={
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-muted-foreground ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
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

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
          <div className="grid divide-y divide-border/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <Stat
              label="Residents"
              value={String(users.length)}
              detail="Registered accounts"
              icon={Users}
            />
            <Stat
              label="Maintenance records"
              value={String(maintenance.length)}
              detail="All billing cycles"
              icon={Wrench}
            />
            <Stat
              label="Open records"
              value={String(openRecords)}
              detail="Awaiting payment"
              icon={CalendarDays}
              tone={openRecords > 0 ? "warning" : "success"}
            />
            <Stat
              label="Total outstanding"
              value={formatCurrency(totalOutstanding)}
              detail="Across all residents"
              icon={Wallet}
              tone={totalOutstanding > 0 ? "warning" : "success"}
            />
          </div>
        </section>

        <form
          onSubmit={handleCreateMaintenance}
          className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6"
        >
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-accent-foreground">
              <Wrench className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Raise a maintenance charge
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create a billing record for a resident&apos;s flat.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground">
                Resident
              </span>
              <select
                value={residentId}
                onChange={(event) => setResidentId(event.target.value)}
                required
                className={INPUT_CLASS}
              >
                <option value="">Select a resident</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground">
                Amount
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className={INPUT_CLASS}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground">
                Due date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
                className={INPUT_CLASS}
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create record"}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">Residents</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Manage access and roles for registered residents.
              </p>
            </div>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
              {users.length} accounts
            </span>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-muted/70"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-medium text-muted-foreground">
                    <th className="px-5 py-3">Resident</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 text-right">Access</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60 text-[13px]">
                  {users.map((user) => {
                    const initials = user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr
                        key={user._id}
                        className="transition-colors hover:bg-muted/25"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {user.name}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={user.role}
                            onChange={(event) =>
                              handleRoleChange(user._id, event.target.value)
                            }
                            className="h-8 rounded-lg border border-border bg-card px-2 text-[11px] capitalize text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                          >
                            <option value="resident">Resident</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            aria-label={`Delete ${user.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Maintenance records
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Every charge raised across the society.
              </p>
            </div>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
              {maintenance.length} records
            </span>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-muted/70"
                />
              ))}
            </div>
          ) : maintenance.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Shield className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No maintenance records yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the form above to raise the first charge.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-medium text-muted-foreground">
                    <th className="px-5 py-3">Resident</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60 text-[13px]">
                  {maintenance.map((record) => (
                    <tr
                      key={record._id}
                      className="transition-colors hover:bg-muted/25"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">
                          {record.userId?.name ?? "Unknown resident"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {record.userId?.email ?? "Account removed"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-foreground tabular-nums">
                        {formatCurrency(record.pendingAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatDate(record.dueDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          variant={statusVariant(record.status)}
                          size="sm"
                        >
                          {record.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning";
}) {
  const classes = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald/10 text-emerald",
    warning: "bg-amber/10 text-amber",
  }[tone];

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-[23px] font-semibold tracking-[-0.03em] text-foreground tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${classes}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
