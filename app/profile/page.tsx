"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Calendar, KeyRound, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

import AppShell from "../components/layout/AppShell";
import { apiFetch } from "@/app/lib/api";
import { formatDate, type Profile, type ProfileResponse } from "@/app/lib/types";

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

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <User className="h-4 w-4" />
            <span>Account Management</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Resident Profile
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            View your resident details, update contact records, or modify credentials.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading profile information...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account Details Card */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-base font-bold text-foreground">
                Account Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official residency identity registered with society management.
              </p>

              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <ReadOnly
                  icon={Mail}
                  label="Email"
                  value={profile?.email ?? "-"}
                />
                <ReadOnly
                  icon={Shield}
                  label="Role"
                  value={profile?.role ?? "-"}
                />
                <ReadOnly
                  icon={Calendar}
                  label="Member since"
                  value={formatDate(profile?.createdAt)}
                />
              </dl>

              <p className="mt-4 text-xs text-muted-foreground/80">
                Email and society roles are strictly managed by your society administrator.
              </p>
            </section>

            {/* Edit details form */}
            <form
              onSubmit={handleSaveProfile}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="text-base font-bold text-foreground">
                Edit Contact Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep your resident address and phone numbers up to date.
              </p>

              <div className="mt-5 space-y-4">
                <Field
                  label="Full Name"
                  value={form.name}
                  onChange={(value) =>
                    setForm((previous) => ({ ...previous, name: value }))
                  }
                />

                <Field
                  label="Phone Number"
                  value={form.phone}
                  onChange={(value) =>
                    setForm((previous) => ({ ...previous, phone: value }))
                  }
                />

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Flat / House Address
                  </span>

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
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {savingProfile ? "Saving Details..." : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Change password form */}
            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  Security & Password
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ensure your account is protected with a strong, distinct password.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Current Password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(value) =>
                    setPasswords((previous) => ({
                      ...previous,
                      currentPassword: value,
                    }))
                  }
                />

                <Field
                  label="New Password"
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

              <p className="mt-3 text-xs text-muted-foreground">
                Must be at least 8 characters in length.
              </p>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            {/* Danger zone */}
            <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <h2 className="text-base font-bold">Danger Zone</h2>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Permanently eliminate your user profile and all associated data records, including historical dues and maintenance receipts.
              </p>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-destructive/50 bg-background px-4 py-2.5 text-xs font-bold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
              >
                {deleting ? "Deleting Account..." : "Permanently Delete My Account"}
              </button>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ReadOnly({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <span>{label}</span>
      </div>
      <dd className="mt-1 text-sm font-bold capitalize text-foreground">
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
