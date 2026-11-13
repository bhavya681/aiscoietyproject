"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  Plus,
  Shield,
  Users,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/api";
import type { SocietySummary } from "@/app/lib/types";

type CurrentSociety = {
  _id: string;
  name: string;
  slug: string;
  inviteCode: string;
  address: string;
  monthlyMaintenance: number;
  role: SocietySummary["role"];
  flat: string;
};

type CurrentSocietyResponse = {
  society: CurrentSociety;
  canManage: boolean;
};

type SocietiesResponse = {
  societies: SocietySummary[];
  activeSocietyId: string | null;
};

const INPUT_CLASS =
  "h-10 w-full rounded-[10px] border border-input bg-card px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function SocietiesPage() {
  const [societies, setSocieties] = useState<SocietySummary[]>([]);
  const [activeSocietyId, setActiveSocietyId] = useState<string | null>(null);
  const [current, setCurrent] = useState<CurrentSociety | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  async function load() {
    try {
      const [list, active] = await Promise.all([
        apiFetch<SocietiesResponse>("/societies"),
        apiFetch<CurrentSocietyResponse>("/societies/current").catch(() => null),
      ]);

      setSocieties(list.societies);
      setActiveSocietyId(list.activeSocietyId);
      setCurrent(active?.society ?? null);
      setCanManage(active?.canManage ?? false);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load societies."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [list, active] = await Promise.all([
          apiFetch<SocietiesResponse>("/societies"),
          apiFetch<CurrentSocietyResponse>("/societies/current").catch(
            () => null
          ),
        ]);

        if (cancelled) {
          return;
        }

        setSocieties(list.societies);
        setActiveSocietyId(list.activeSocietyId);
        setCurrent(active?.society ?? null);
        setCanManage(active?.canManage ?? false);
        setError("");
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load societies."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSwitch(societyId: string) {
    if (societyId === activeSocietyId) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/societies/switch", {
        method: "POST",
        body: { societyId },
      });

      window.location.reload();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not switch society."
      );
      setBusy(false);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/societies", {
        method: "POST",
        body: { name: newName, address: newAddress },
      });

      setNewName("");
      setNewAddress("");
      await load();
      setNotice("Society created. You are now the owner.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create the society."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(event: React.FormEvent) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/societies/join", {
        method: "POST",
        body: { inviteCode },
      });

      setInviteCode("");
      await load();
      setNotice("Joined the society.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not join the society."
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyInviteCode() {
    if (!current) {
      return;
    }

    try {
      await navigator.clipboard.writeText(current.inviteCode);
      setNotice("Invite code copied.");
    } catch {
      setError("Could not copy the invite code.");
    }
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 lg:space-y-8">
        <PageHeader
          eyebrow="Your communities"
          title="Societies"
          description="Create a society, join one with an invite code, and switch between the communities you belong to."
          action={
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Back to dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />

        {error && (
          <Banner tone="error" message={error} />
        )}
        {notice && <Banner tone="success" message={notice} />}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-border/70 bg-card"
              />
            ))
          ) : societies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 md:col-span-2 xl:col-span-3">
              <Building2 className="h-7 w-7 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium text-foreground">
                You have not joined a society yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create one below, or ask an admin for the invite code.
              </p>
            </div>
          ) : (
            societies.map((society) => {
              const active = society._id === activeSocietyId;

              return (
                <article
                  key={society._id}
                  className={`flex flex-col rounded-2xl border bg-card p-5 shadow-card transition-colors ${
                    active ? "border-primary/40" : "border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {society.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {society.role === "owner"
                            ? "Owner"
                            : society.role === "admin"
                              ? "Admin"
                              : "Resident"}
                          {society.flat ? ` · ${society.flat}` : ""}
                        </p>
                      </div>
                    </div>
                    {active && (
                      <StatusBadge variant="success" size="sm">
                        Active
                      </StatusBadge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSwitch(society._id)}
                      disabled={active || busy}
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-[9px] bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {active ? "Current society" : "Switch to this"}
                    </button>
                    {canManage && active && (
                      <Link
                        href="/admin"
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium text-foreground">
                Create a society
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              You become the owner and can add residents, raise maintenance and
              manage the society.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-foreground">
                  Society name
                </span>
                <input
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Palm Grove Residency"
                  required
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-foreground">
                  Address (optional)
                </span>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(event) => setNewAddress(event.target.value)}
                  placeholder="Bandra West, Mumbai"
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? "Creating..." : "Create society"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleJoin}
            className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium text-foreground">
                Join with an invite code
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Ask the society admin for their invite code. You can join as many
              societies as you need.
            </p>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium text-foreground">
                Invite code
              </span>
              <input
                type="text"
                value={inviteCode}
                onChange={(event) =>
                  setInviteCode(event.target.value.toUpperCase())
                }
                placeholder="A1B2C3D4"
                required
                className={`${INPUT_CLASS} font-mono uppercase tracking-[0.18em] placeholder:tracking-normal`}
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {busy ? "Joining..." : "Join society"}
              </button>
            </div>
          </form>
        </div>

        {current && (
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  Invite code for {current.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Share this code so residents can join your society.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded-lg bg-muted px-3 py-2 font-mono text-sm tracking-[0.2em] text-foreground">
                  {current.inviteCode}
                </code>
                <button
                  type="button"
                  onClick={copyInviteCode}
                  aria-label="Copy invite code"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </section>
        )}
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