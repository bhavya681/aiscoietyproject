"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "resident",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: string,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await apiFetch("/users/signup", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          phone: Number(form.phone),
        }),
      });

      router.push("/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-3xl font-bold text-white">
          Create account
        </h1>

        <p className="mt-2 text-zinc-400">
          Join your society
        </p>

        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-5"
        >
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
            className="input"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              updateField("email", e.target.value)
            }
            className="input"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              updateField("password", e.target.value)
            }
            className="input"
            required
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              updateField("phone", e.target.value)
            }
            className="input"
            required
          />

          <textarea
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              updateField("address", e.target.value)
            }
            className="input min-h-28"
            required
          />

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}