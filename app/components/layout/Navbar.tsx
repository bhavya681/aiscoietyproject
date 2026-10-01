"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/app/lib/api";
import type { Profile } from "@/app/lib/types";

type NavbarProps = {
  user?: Profile | null;
};

/**
 * Top bar for the signed-in app shell.
 *
 * Logout calls the server so the httpOnly auth cookie is cleared, then clears
 * any cached UI state by doing a full navigation.
 */
export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await apiFetch("/users/logout", { method: "POST" });
    } catch {
      // Even if the call fails, send the user to the login screen.
    } finally {
      setLoggingOut(false);

      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">SocietyAI</h1>
        <p className="text-xs text-zinc-500">Smart society management</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-zinc-900">
            {user?.name ?? "Resident"}
          </p>

          <p className="text-xs text-zinc-500">{user?.email ?? ""}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
          {(user?.name || "R").charAt(0).toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
