"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  type MaintenanceRecord,
  type MembershipRole,
} from "@/app/lib/types";

type AdminMember = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  flat: string;
  role: MembershipRole;
  joinedAt?: string;
};

type LookupUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  alreadyMember: boolean;
};

type PopulatedMaintenance = Omit<MaintenanceRecord, "userId"> & {
  userId: { _id: string; name: string; email: string } | null;
};

const INPUT_CLASS =
  "h-10 w-full rounded-[10px] border border-input bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

async function fetchAdminData() {
  const [membersData, maintenanceData] = await Promise.all([
    apiFetch<{ members: AdminMember[]; inviteCode: string }>("/admin/users"),
    apiFetch<{ maintenance: PopulatedMaintenance[] }>("/admin/maintenance"),
  ]);

  return {
    members: membersData.members,
    inviteCode: membersData.inviteCode,
    maintenance: maintenanceData.maintenance,
  };
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
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [maintenance, setMaintenance] = useState<PopulatedMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupUser, setLookupUser] = useState<LookupUser | null>(null);
  const [looking, setLooking] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<MembershipRole>("resident");
  const [newMemberFlat, setNewMemberFlat] = useState("");
  const [adding, setAdding] = useState(false);

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

        setMembers(data.members);
        setInviteCode(data.inviteCode);
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

      setMembers(data.members);
      setInviteCode(data.inviteCode);
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

  async function handleLookup(event: React.FormEvent) {
    event.preventDefault();

    setLooking(true);
    setError("");
    setNotice("");
    setLookupUser(null);

    try {
      const data = await apiFetch<{ user: LookupUser | null }>(
        `/societies/members/lookup?email=${encodeURIComponent(
          lookupEmail.trim()
        )}`
      );

      setLookupUser(data.user);

      if (!data.user) {
        setError(
          "No account exists with that email. Ask them to create an account first."
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not look up the account."
      );
    } finally {
      setLooking(false);
    }
  }

  async function handleAddMember() {
    if (!lookupUser || lookupUser.alreadyMember) {
      return;
    }

    setAdding(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/societies/members", {
        method: "POST",
        body: {
          email: lookupUser.email,
          role: newMemberRole,
          flat: newMemberFlat,
        },
      });

      setNotice(`${lookupUser.name} was added to the society.`);
      setLookupUser(null);
      setLookupEmail("");
      setNewMemberFlat("");
      setNewMemberRole("resident");

      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not add the member."
      );
    } finally {
      setAdding(false);
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

  async function handleRoleChange(userId: string, role: MembershipRole) {
    setError("");
    setNotice("");

    try {
      await apiFetch(`/societies/members/${userId}`, {
        method: "PATCH",
        body: { role },
      });

      setNotice("Member role updated.");
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update the role."
      );
    }
  }

  async function handleRemoveMember(userId: string, name: string) {
    if (
      !window.confirm(`Remove ${name} from this society? Their history is kept.`)
    ) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await apiFetch(`/societies/members/${userId}`, { method: "DELETE" });

      setNotice("Member removed.");
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not remove the member."
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
      <div className="w-full space-y-6 lg:space-y-8">
        <PageHeader
          eyebrow="Society administration"
          title="Admin panel"
          description="Manage the residents of your society, raise maintenance charges, and keep the ledger accurate."
          action={
            <>
              <Link
                href="/societies"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Switch society
              </Link>
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
            </>
          }
        />

        {error && <Banner tone="error" message={error} />}
        {notice && <Banner tone="success" message={notice} />}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Members"
            value={String(members.length)}
            detail="In this society"
          />
          <Stat
            label="Maintenance records"
            value={String(maintenance.length)}
            detail="All billing cycles"
          />
          <Stat
            label="Open records"
            value={String(openRecords)}
            detail="Awaiting payment"
            tone={openRecords > 0 ? "warning" : "success"}
          />
          <Stat
            label="Total outstanding"
            value={formatCurrency(totalOutstanding)}
            detail="Across this society"
            tone={totalOutstanding > 0 ? "warning" : "success"}
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-12">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6 xl:col-span-5">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium text-foreground">
                Add a member
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Look up an existing account by email and add them to this society.
            </p>

            <form onSubmit={handleLookup} className="mt-4 flex gap-2">
              <input
                type="email"
                value={lookupEmail}
                onChange={(event) => setLookupEmail(event.target.value)}
                placeholder="resident@example.com"
                required
                className={INPUT_CLASS}
              />
              <button
                type="submit"
                disabled={looking}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {looking ? "Searching..." : "Find"}
              </button>
            </form>

            {lookupUser && !lookupUser.alreadyMember && (
              <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-3.5">
                <p className="text-xs font-medium text-foreground">
                  {lookupUser.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {lookupUser.email}
                  {lookupUser.phone ? ` · ${lookupUser.phone}` : ""}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Role
                    </span>
                    <select
                      value={newMemberRole}
                      onChange={(event) =>
                        setNewMemberRole(event.target.value as MembershipRole)
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="resident">Resident</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Flat / unit
                    </span>
                    <input
                      type="text"
                      value={newMemberFlat}
                      onChange={(event) => setNewMemberFlat(event.target.value)}
                      placeholder="B-402"
                      className={INPUT_CLASS}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={adding}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-[9px] bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add to society"}
                </button>
              </div>
            )}

            {lookupUser?.alreadyMember && (
              <p className="mt-3 rounded-lg bg-amber/10 px-3 py-2 text-[11px] text-amber">
                That person is already a member of this society.
              </p>
            )}

            {inviteCode && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
                <span className="text-[11px] text-muted-foreground">
                  Invite code
                </span>
                <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs tracking-[0.18em] text-foreground">
                  {inviteCode}
                </code>
              </div>
            )}
          </div>

          <form
            onSubmit={handleCreateMaintenance}
            className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6 xl:col-span-7"
          >
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Raise a maintenance charge
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create a billing record for a member&apos;s flat.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-foreground">
                  Member
                </span>
                <select
                  value={residentId}
                  onChange={(event) => setResidentId(event.target.value)}
                  required
                  className={INPUT_CLASS}
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                      {member.flat ? ` (${member.flat})` : ""}
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
                disabled={creating || members.length === 0}
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create record"}
              </button>
            </div>
          </form>
        </div>

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">Members</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Manage roles and access for this society.
              </p>
            </div>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
              {members.length} members
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
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Flat</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 text-right">Access</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60 text-[13px]">
                  {members.map((member) => {
                    const initials = member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    const isOwner = member.role === "owner";

                    return (
                      <tr
                        key={member._id}
                        className="transition-colors hover:bg-muted/25"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {member.name}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {member.flat || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {formatDate(member.joinedAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          {isOwner ? (
                            <StatusBadge variant="info" size="sm">
                              Owner
                            </StatusBadge>
                          ) : (
                            <select
                              value={member.role}
                              onChange={(event) =>
                                handleRoleChange(
                                  member._id,
                                  event.target.value as MembershipRole
                                )
                              }
                              className="h-8 rounded-lg border border-border bg-card px-2 text-[11px] capitalize text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                            >
                              <option value="resident">Resident</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isOwner ? (
                            <span className="text-[11px] text-muted-foreground">
                              —
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMember(member._id, member.name)
                              }
                              aria-label={`Remove ${member.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
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
                Every charge raised in this society.
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
              <p className="text-sm font-medium text-foreground">
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
                    <th className="px-5 py-3">Member</th>
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
                          {record.userId?.name ?? "Unknown member"}
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

function Banner({
  tone,
  message,
}: {
  tone: "error" | "success";
  message: string;
}) {
  const isError = tone === "error";

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-destructive/20 bg-destructive/[0.06] text-destructive"
          : "border-emerald/20 bg-emerald/[0.07] text-emerald"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning";
}) {
  const dotClasses = {
    default: "bg-muted-foreground/40",
    success: "bg-emerald",
    warning: "bg-amber",
  }[tone];

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClasses}`} />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2.5 text-[23px] font-semibold tracking-[-0.03em] text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}