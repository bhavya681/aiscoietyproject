"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
  History,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
  Wrench,
  X,
} from "lucide-react";

import { apiFetch } from "@/app/lib/api";
import type { Profile, Role, SocietySummary } from "@/app/lib/types";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import { cn } from "@/app/lib/utils";

const WORKSPACE_NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Payment history", href: "/maintenance/history", icon: History },
] as const;

const SUPPORT_NAVIGATION = [
  { name: "AI assistant", href: "/ai", icon: Bot },
  { name: "Profile", href: "/profile", icon: User },
] as const;

const ADMIN_NAVIGATION = [
  { name: "Admin panel", href: "/admin", icon: Shield },
] as const;

const SOCIETY_NAVIGATION = [
  { name: "Your societies", href: "/societies", icon: Building2 },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/maintenance") {
    return (
      pathname === "/maintenance" ||
      pathname.startsWith("/maintenance/invoice")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarProps = {
  role?: Role;
  user?: Profile | null;
  onCollapse?: (collapsed: boolean) => void;
};

export default function Sidebar({ role, user, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border/70 bg-card/35 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-[252px]"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border/60 px-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            collapsed && "justify-center"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-sm font-semibold tracking-tight text-foreground">
                Society<span className="text-primary">AI</span>
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Palm Grove Residency
              </span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "absolute left-[58px] top-5 z-10 border border-border bg-card shadow-sm"
          )}
        >
          <ChevronLeft
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      <SocietySwitcher user={user} collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        <NavGroup
          label="Workspace"
          items={WORKSPACE_NAVIGATION}
          pathname={pathname}
          collapsed={collapsed}
        />

        <div className="mt-5">
          <NavGroup
            label="Your account"
            items={SUPPORT_NAVIGATION}
            pathname={pathname}
            collapsed={collapsed}
          />
        </div>

        <div className="mt-5">
          <NavGroup
            label="Society"
            items={SOCIETY_NAVIGATION}
            pathname={pathname}
            collapsed={collapsed}
          />
        </div>

        {role === "admin" && (
          <div className="mt-5">
            <NavGroup
              label="Administration"
              items={ADMIN_NAVIGATION}
              pathname={pathname}
              collapsed={collapsed}
            />
          </div>
        )}
      </nav>

      <SidebarAccount user={user} collapsed={collapsed} />
    </aside>
  );
}

function SocietySwitcher({
  user,
  collapsed,
}: {
  user?: Profile | null;
  collapsed: boolean;
}) {
  const [switching, setSwitching] = useState(false);
  const societies: SocietySummary[] = user?.societies ?? [];
  const activeSocietyId = user?.activeSocietyId ?? null;

  async function handleSwitch(societyId: string) {
    if (!societyId || societyId === activeSocietyId) {
      return;
    }

    setSwitching(true);

    try {
      await apiFetch("/societies/switch", {
        method: "POST",
        body: { societyId },
      });

      window.location.reload();
    } catch {
      setSwitching(false);
    }
  }

  if (collapsed) {
    return (
      <div className="border-b border-border/60 p-2.5">
        <Link
          href="/societies"
          title="Switch society"
          className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Building2 className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (societies.length === 0) {
    return (
      <div className="border-b border-border/60 p-3">
        <Link
          href="/societies"
          className="flex items-center justify-between rounded-[10px] border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span>Create or join a society</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="border-b border-border/60 px-3 py-3">
      <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        Society
      </p>
      <div className="relative">
        <select
          value={activeSocietyId ?? ""}
          onChange={(event) => handleSwitch(event.target.value)}
          disabled={switching}
          aria-label="Active society"
          className="h-9 w-full appearance-none rounded-[9px] border border-border bg-card px-2.5 pr-7 text-[12px] font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
        >
          {activeSocietyId === null && (
            <option value="">Select a society</option>
          )}
          {societies.map((society) => (
            <option key={society._id} value={society._id}>
              {society.name}
            </option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90 text-muted-foreground" />
      </div>
      {switching && (
        <p className="mt-1 px-1 text-[10px] text-muted-foreground">
          Switching...
        </p>
      )}
    </div>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
}: {
  label: string;
  items: ReadonlyArray<{
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
  }>;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
          {label}
        </p>
      )}

      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-[13px] font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              {!collapsed && <span className="flex-1">{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SidebarAccount({
  user,
  collapsed,
  onNavigate,
  showTheme = true,
}: {
  user?: Profile | null;
  collapsed: boolean;
  onNavigate?: () => void;
  showTheme?: boolean;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await apiFetch("/users/logout", { method: "POST" });
    } catch {
      // Redirect regardless; the proxy will handle an expired session.
    } finally {
      setLoggingOut(false);
      onNavigate?.();
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

  if (collapsed) {
    return (
      <div className="border-t border-border/60 p-2.5">
        <div className="flex flex-col items-center gap-1.5">
          <Link
            href="/profile"
            title="Your profile"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {initials}
          </Link>

          {showTheme && <ThemeToggle side="top" align="left" />}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border/60 p-3">
      <Link
        href="/profile"
        onClick={onNavigate}
        className="group flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-muted/70"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-[11px] font-semibold text-primary-foreground">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-foreground">
            {user?.name ?? "Resident"}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {user?.activeSociety?.role === "admin" ||
            user?.activeSociety?.role === "owner"
            ? "Administrator"
            : user?.email || "Resident"}
          </span>
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div className="mt-2 flex items-center gap-1.5">
        {showTheme && <ThemeToggle side="top" align="left" />}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border/70 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function MobileSidebar({
  user,
  role,
  open,
  onClose,
}: {
  user?: Profile | null;
  role?: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const groups = [
    { label: "Workspace", items: WORKSPACE_NAVIGATION },
    { label: "Your account", items: SUPPORT_NAVIGATION },
    { label: "Society", items: SOCIETY_NAVIGATION },
    ...(role === "admin"
      ? [{ label: "Administration", items: ADMIN_NAVIGATION }]
      : []),
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-foreground">
                Society<span className="text-primary">AI</span>
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Resident workspace
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {groups.map((group, index) => (
            <div key={group.label} className={index > 0 ? "mt-5" : ""}>
              <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
                {group.label}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <SidebarAccount
          user={user}
          collapsed={false}
          onNavigate={onClose}
          showTheme={false}
        />
      </aside>
    </>
  );
}
