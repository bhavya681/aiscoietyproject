"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/app/lib/api";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

const EMPTY_FORM: SignupForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof SignupForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      // Note: no `role` is sent. The server always creates residents, so a
      // visitor cannot sign themselves up as an admin.
      await apiFetch("/users/signup", { method: "POST", body: form });

      router.push("/login");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <Link href="/" className="text-sm font-semibold text-indigo-400">
          ← SocietyAI
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-white">Create account</h1>

        <p className="mt-2 text-zinc-400">
          Join your society. New accounts are created as residents.
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="input"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="input"
            required
          />

          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                updateField("password", event.target.value)
              }
              className="input"
              minLength={8}
              required
            />

            <p className="mt-2 text-xs text-zinc-500">
              Minimum 8 characters.
            </p>
          </div>

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="input"
            required
          />

          <textarea
            placeholder="Flat address"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="input min-h-28"
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-400">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
