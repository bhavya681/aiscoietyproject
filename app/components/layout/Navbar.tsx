"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, User, LogOut, ChevronDown, Sparkles, Building2, Shield } from "lucide-react";

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
      // Fallback
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
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-4 sm:px-6 backdrop-blur-xl transition-colors">
        
        {/* Left: Mobile trigger & Society brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-[#14151B] border border-black/[0.08] dark:border-white/[0.1] shadow-xs">
              <img
                src={resolved === "dark" ? "/logo.png" : "/logo-light.png"}
                alt="SocietyAI"
                className="h-5 w-5 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                Society<span className="text-[#315CF5]">AI</span>
                {user?.role === "admin" && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-medium uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Admin
                  </span>
                )}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Quick shortcuts, Theme toggle & Profile menu */}
        <div className="flex items-center gap-2.5">
          
          <Link
            href="/ai"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#315CF5]/20 bg-[#315CF5]/5 text-xs font-medium text-[#315CF5] hover:bg-[#315CF5]/10 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Concierge</span>
          </Link>

          <ThemeToggle />

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-accent"
              aria-label="User profile options"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#315CF5]/10 text-xs font-semibold text-[#315CF5]">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight text-foreground truncate max-w-[100px]">
                  {user?.name ?? "Resident"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {user?.role === "admin" ? "Society Admin" : "Flat Owner"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
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
                <div className="absolute right-0 top-full mt-2 z-50 w-60 rounded-2xl border border-border/80 bg-card p-1.5 shadow-xl">
                  <div className="px-3 py-2.5 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground">
                      {user?.name ?? "Resident User"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Account Settings</span>
                    </Link>

                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 transition-colors hover:bg-purple-500/10"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Administration</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-border/60 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
                    </button>
                  </div>
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