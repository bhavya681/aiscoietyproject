"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu } from "lucide-react";

import type { Profile, Role } from "@/app/lib/types";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import { MobileSidebar } from "./Sidebar";

type NavbarProps = {
  user?: Profile | null;
  role?: Role;
};

const PAGE_LABELS: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/maintenance/history", label: "Payment history" },
  { href: "/maintenance/invoice", label: "Invoice" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/ai", label: "AI assistant" },
  { href: "/profile", label: "Profile" },
  { href: "/societies", label: "Societies" },
  { href: "/admin", label: "Admin panel" },
];

function getPageLabel(pathname: string) {
  return (
    PAGE_LABELS.find((page) => pathname.startsWith(page.href))?.label ??
    "Workspace"
  );
}

export default function Navbar({ user, role }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-border/70 bg-card">
              <Building2 className="h-4 w-4 text-primary" />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              {getPageLabel(pathname)}
            </span>
          </Link>
        </div>

        <ThemeToggle />
      </header>

      <MobileSidebar
        user={user}
        role={role}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
