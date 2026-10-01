"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      setNotice("Profile updated.");
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
      setNotice("Password updated.");
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
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm text-zinc-500">Account</p>
          <h1 className="mt-1 text-3xl font-bold">Profile</h1>
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

        {loading ? (
          <p className="text-sm text-zinc-500">Loading profile...</p>
        ) : (
          <>
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="font-semibold">Account details</h2>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <ReadOnly label="Email" value={profile?.email ?? "-"} />
                <ReadOnly label="Role" value={profile?.role ?? "-"} />
                <ReadOnly
                  label="Member since"
                  value={formatDate(profile?.createdAt)}
                />
              </dl>

              <p className="mt-4 text-xs text-zinc-500">
                Email and role are managed by the society administrator.
              </p>
            </section>

            <form
              onSubmit={handleSaveProfile}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <h2 className="font-semibold">Edit details</h2>

              <div className="mt-4 space-y-4">
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(value) =>
                    setForm((previous) => ({ ...previous, name: value }))
                  }
                />

                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) =>
                    setForm((previous) => ({ ...previous, phone: value }))
                  }
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700">
                    Address
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
                    className="min-h-24 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </form>

            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <h2 className="font-semibold">Change password</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
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

                <Field
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

              <p className="mt-2 text-xs text-zinc-500">
                Minimum 8 characters.
              </p>

              <button
                type="submit"
                disabled={savingPassword}
                className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {savingPassword ? "Updating..." : "Update password"}
              </button>
            </form>

            <section className="rounded-2xl border border-red-200 bg-white p-6">
              <h2 className="font-semibold text-red-700">Danger zone</h2>

              <p className="mt-2 text-sm text-zinc-600">
                Deleting your account permanently removes your maintenance,
                payment and invoice records.
              </p>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="mt-4 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete my account"}
              </button>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium capitalize text-zinc-900">
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
      <span className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />
    </label>
  );
}
