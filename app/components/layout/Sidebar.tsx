"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    name: "Maintenance",
    href: "/maintenance",
    icon: "₹",
  },
  {
    name: "Payment History",
    href: "/maintenance/history",
    icon: "↗",
  },
  {
    name: "AI Assistant",
    href: "/ai",
    icon: "✦",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: "○",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-64 border-r border-zinc-200 bg-white md:block">
      <div className="p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Menu
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center text-sm">
                  {item.icon}
                </span>

                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}