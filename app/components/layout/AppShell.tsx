"use client";

import { useEffect, useState, type ReactNode } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { apiFetch } from "@/app/lib/api";
import type { Profile, ProfileResponse } from "@/app/lib/types";

/**
 * Shared chrome for every signed-in page.
 *
 * The profile is fetched once here so the navbar and the admin-only navigation
 * can show the real signed-in user instead of placeholder text.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await apiFetch<ProfileResponse>("/users/profile");

        if (!cancelled) {
          setUser(data.profile);
        }
      } catch (error) {
        // The proxy already redirects signed-out users, so reaching here means
        // something else went wrong.
        console.error("Failed to load profile:", error);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar user={user} />

      <div className="flex">
        <Sidebar role={user?.role} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
