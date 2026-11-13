"use client";

import { useEffect, useState, type ReactNode } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { apiFetch } from "@/app/lib/api";
import type { Profile, ProfileResponse, Role } from "@/app/lib/types";

/**
 * Shared chrome for every signed-in page.
 *
 * The profile is fetched once here so the navbar and the admin-only navigation
 * can show the real signed-in user instead of placeholder text.
 */
export default function AppShell({
  children,
  fullBleed = false,
}: {
  children: ReactNode;
  fullBleed?: boolean;
}) {
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

  const societyRole = user?.activeSociety?.role;
  const canAdmin =
    societyRole === "owner" || societyRole === "admin";
  const sidebarRole: Role | undefined = user
    ? canAdmin
      ? "admin"
      : "resident"
    : undefined;

  return (
    <div className="min-h-dvh bg-background selection:bg-primary/20">
      <Navbar user={user} role={sidebarRole} />

      <div className="flex">
        <Sidebar role={sidebarRole} user={user} />

        <main
          className={
            fullBleed
              ? "h-[calc(100dvh-3.5rem)] min-w-0 flex-1 overflow-hidden lg:h-dvh"
              : "min-w-0 w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}