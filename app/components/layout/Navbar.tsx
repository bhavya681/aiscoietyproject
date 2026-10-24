"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, User, LogOut, Bell, ChevronDown } from "lucide-react";

import { apiFetch } from "@/app/lib/api";
import type { Profile } from "@/app/lib/types";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import { useTheme } from "@/app/lib/theme";
import { cn } from "@/app/lib/utils";
import { MobileSidebar } from "./Sidebar";

type NavbarProps = {
  user?: Profile | null;
};

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const { resolved } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await apiFetch("/users/logout", { method: "POST" });
    } catch {
      // Even if the call fails, send the user to the login screen.
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
      setMobileMenuOpen(false);

      router.replace("/login");
      router.refresh();
    }
  }

  const initials = (user?.name || "R")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <a
            href="/dashboard"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <img
                src={resolved === "dark" ? "/logo.png" : "/logo-light.png"}
                alt="SocietyAI"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              SocietyAI
            </span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  menuOpen && "rotate-180"
                )}
              />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card p-1 shadow-lg">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">
                      {user?.name ?? "Resident"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <a
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileSidebar
        role={user?.role}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}