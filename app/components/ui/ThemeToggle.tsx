"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/app/lib/theme";
import { cn } from "@/app/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function ThemeToggle({
  side = "bottom",
  align = "right",
}: {
  side?: "top" | "bottom";
  align?: "left" | "right";
}) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const CurrentIcon =
    OPTIONS.find((option) => option.value === theme)?.icon ?? Monitor;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Change theme"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <CurrentIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 w-40 rounded-xl border border-border/80 bg-card p-1 shadow-card",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">{option.label}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
