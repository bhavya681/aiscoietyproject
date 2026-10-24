"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Wrench,
  History,
  Bot,
  User,
  Shield,
  ChevronLeft,
  X,
  Building2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import type { Role } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";

const NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Payment History", href: "/maintenance/history", icon: History },
  { name: "AI Assistant", href: "/ai", icon: Bot, highlight: true },
  { name: "Profile", href: "/profile", icon: User },
] as const;

const ADMIN_NAVIGATION = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
] as const;

type SidebarProps = {
  role?: Role;
  onCollapse?: (collapsed: boolean) => void;
};

export default function Sidebar({ role, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const items =
    role === "admin"
      ? [...ADMIN_NAVIGATION, ...NAVIGATION]
      : [...NAVIGATION];

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border/80 bg-card/60 backdrop-blur-xl transition-all duration-300 ease-in-out md:flex",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand & collapse trigger */}
      <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#315CF5] text-white shadow-sm shadow-[#315CF5]/20">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-foreground leading-none">
                Society<span className="text-[#315CF5]">AI</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
                Workspace
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Main navigation list */}
      <nav className="flex-1 space-y-1.5 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-[#315CF5]/10 text-[#315CF5] dark:text-[#819eff] font-semibold"
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#315CF5]" />
              )}
              <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105", active && "text-[#315CF5]")} />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.name}</span>
                  {"highlight" in item && item.highlight && (
                    <span className="flex h-2 w-2 rounded-full bg-[#315CF5] animate-pulse" />
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom shortcut */}
      {!collapsed && (
        <div className="p-3 border-t border-border/60">
          <Link
            href="/ai"
            className="flex flex-col gap-2 rounded-xl border border-[#315CF5]/20 bg-[#315CF5]/5 p-3 hover:bg-[#315CF5]/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#315CF5]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask SocietyAI</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Instant answers on maintenance &amp; dues.
            </p>
          </Link>
        </div>
      )}
    </aside>
  );
}

export function MobileSidebar({
  role,
  open,
  onClose,
}: {
  role?: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const items =
    role === "admin"
      ? [...ADMIN_NAVIGATION, ...NAVIGATION]
      : [...NAVIGATION];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#315CF5] text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-foreground">
                Society<span className="text-[#315CF5]">AI</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                Mobile Portal
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#315CF5]/10 text-[#315CF5] dark:text-[#819eff] font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5", active && "text-[#315CF5]")} />
                  <span>{item.name}</span>
                </div>
                {"highlight" in item && item.highlight && (
                  <span className="rounded-full bg-[#315CF5]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[#315CF5]">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <User className="h-5 w-5" />
            <span>Profile &amp; Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}