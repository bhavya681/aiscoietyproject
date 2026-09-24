"use client";

import { useRouter } from "next/navigation";

type NavbarProps = {
  user?: {
    name?: string;
    email?: string;
  };
};

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">
          SocietyAI
        </h1>
        <p className="text-xs text-zinc-500">
          Smart society management
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-zinc-900">
            {user?.name || "Resident"}
          </p>

          <p className="text-xs text-zinc-500">
            {user?.email || ""}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
          {(user?.name || "R").charAt(0).toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}