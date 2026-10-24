"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/app/lib/theme";

const ICON_SIZE = 16;

export default function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme();

  const isDark = resolved === "dark";

  return (
    <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        title="Light mode"
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          theme === "light"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sun size={ICON_SIZE} />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        aria-pressed={theme === "system"}
        title="System theme"
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          theme === "system"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Monitor size={ICON_SIZE} />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        title="Dark mode"
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          theme === "dark"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Moon size={ICON_SIZE} />
      </button>
    </div>
  );
}