"use client";

import { useEffect, useState } from "react";

import AppShell from "../components/layout/AppShell";
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

/** Fetches everything the admin page needs in one round trip. */
async function fetchAdminData() {
  const [userData, maintenanceData] = await Promise.all([
    apiFetch<{ users: AdminUser[] }>("/admin/users"),
    apiFetch<{ maintenance: PopulatedMaintenance[] }>("/admin/maintenance"),
  ]);

  return { users: userData.users, maintenance: maintenanceData.maintenance };
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [maintenance, setMaintenance] = useState<PopulatedMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
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

  /** Re-reads the data after a mutation and surfaces any error. */
  async function refresh() {
    try {
      const data = await fetchAdminData();

      setUsers(data.users);
      setMaintenance(data.maintenance);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not refresh data."
      );
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

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm text-zinc-500">Administration</p>
          <h1 className="mt-1 text-3xl font-bold">Admin Panel</h1>
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

        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Residents" value={String(users.length)} />
          <Tile
            label="Maintenance records"
            value={String(maintenance.length)}
          />
          <Tile label="Total outstanding" value={formatCurrency(totalOutstanding)} />
        </div>

        <form
          onSubmit={handleCreateMaintenance}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="font-semibold">Raise maintenance</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">
                Resident
              </span>

              <select
                value={residentId}
                onChange={(event) => setResidentId(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="">Select a resident</option>

                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">
                Amount
              </span>

              <input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">
                Due date
              </span>

              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none focus:border-indigo-500"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create record"}
          </button>
        </form>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Residents</h2>

          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(event) =>
                            handleRoleChange(user._id, event.target.value)
                          }
                          className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs capitalize"
                        >
                          <option value="resident">resident</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteUser(user._id, user.name)
                          }
                          className="text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">All maintenance</h2>

          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Resident</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {maintenance.map((record) => (
                    <tr key={record._id}>
                      <td className="px-4 py-3 font-medium">
                        {record.userId?.name ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {formatCurrency(record.pendingAmount)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {formatDate(record.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            record.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : record.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {record.status}
                        </span>
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

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
