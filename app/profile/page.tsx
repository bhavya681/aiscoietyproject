"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { apiFetch } from "@/app/lib/api";
import {
  formatDate,
  type Profile,
  type ProfileResponse,
} from "@/app/lib/types";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<ProfileResponse>("/users/profile");

        if (cancelled) {
          return;
        }

        setProfile(data.profile);
        setForm({
          name: data.profile.name,
          phone: data.profile.phone ?? "",
          address: data.profile.address ?? "",
        });
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load your profile."
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

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();

    setSavingProfile(true);
    setError("");
    setNotice("");

    try {
      const data = await apiFetch<{ user: Profile }>("/users/update", {
        method: "PATCH",
        body: form,
      });

      setProfile(data.user);
      setNotice("Profile updated successfully.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();

    setSavingPassword(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/users/reset-password", {
        method: "PUT",
        body: passwords,
      });

      setPasswords({ currentPassword: "", newPassword: "" });
      setNotice("Password changed successfully.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "This permanently deletes your account and all its maintenance, payment " +
        "and invoice records. This cannot be undone.\n\nContinue?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await apiFetch("/users/delete", { method: "DELETE" });

      router.replace("/login");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not delete the account."
      );
      setDeleting(false);
    }
  }

  const initials = (profile?.name || "R")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-7">
        <PageHeader
          eyebrow="Account"
          title="Profile and settings"
          description="Keep your resident details current and manage the security of your account."
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

        {loading ? (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
            <div className="mt-4 h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-56 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-4 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                  {initials}
                </div>
                <h2 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {profile?.name ?? "Resident"}
                </h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {profile?.email ?? "—"}
                </p>
                <div className="mt-3">
                  <StatusBadge variant="info" size="sm" className="capitalize">
                    {profile?.role ?? "resident"}
                  </StatusBadge>
                </div>

                <div className="mt-5 space-y-3 border-t border-border/70 pt-4 text-xs">
                  <InfoRow icon={Mail} label="Email" value={profile?.email ?? "—"} />
                  <InfoRow
                    icon={Shield}
                    label="Role"
                    value={profile?.role ?? "resident"}
                    capitalize
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Member since"
                    value={formatDate(profile?.createdAt)}
                  />
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                  Email and society roles are managed by your administrator.
                </p>
              </section>

              <section className="rounded-2xl border border-border/80 bg-muted/35 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  Account security
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  Use a unique password and update it if you notice unusual
                  activity.
                </p>
              </section>
            </aside>

            <div className="space-y-5">
              <form
                onSubmit={handleSaveProfile}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-accent-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-medium text-foreground">
                      Contact details
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Used by the society office to reach you.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Full name"
                    value={form.name}
                    onChange={(value) =>
                      setForm((previous) => ({ ...previous, name: value }))
                    }
                    icon={User}
                  />
                  <InputField
                    label="Phone number"
                    value={form.phone}
                    onChange={(value) =>
                      setForm((previous) => ({ ...previous, phone: value }))
                    }
                    icon={Phone}
                  />
                </div>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-foreground">
                    Flat / house address
                  </span>
                  <span className="relative block">
                    <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <textarea
                      value={form.address}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          address: event.target.value,
                        }))
                      }
                      required
                      rows={3}
                      className="min-h-[88px] w-full resize-none rounded-[10px] border border-input bg-card py-3 pl-10 pr-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </span>
                </label>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleChangePassword}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-muted text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-medium text-foreground">
                      Password
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Choose a strong password you do not use elsewhere.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Current password"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(value) =>
                      setPasswords((previous) => ({
                        ...previous,
                        currentPassword: value,
                      }))
                    }
                  />
                  <InputField
                    label="New password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(value) =>
                      setPasswords((previous) => ({
                        ...previous,
                        newPassword: value,
                      }))
                    }
                  />
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground">
                  Must be at least 8 characters.
                </p>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex h-10 items-center justify-center rounded-[10px] border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>

              <section className="rounded-2xl border border-destructive/25 bg-destructive/[0.035] p-5 sm:p-6">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-medium text-destructive">
                      Delete account
                    </h2>
                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                      This permanently removes your profile and all associated
                      maintenance, payment, and invoice records. This action
                      cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pl-[46px]">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="inline-flex h-9 items-center justify-center rounded-[9px] border border-destructive/30 bg-card px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {deleting ? "Deleting account..." : "Delete my account"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
        <p
          className={`mt-0.5 break-all text-[11px] font-medium text-foreground ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </span>
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className={`h-10 w-full rounded-[10px] border border-input bg-card pr-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
            Icon ? "pl-10" : "pl-3.5"
          }`}
        />
      </span>
    </label>
  );
}
