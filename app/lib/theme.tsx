"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolved: "light" | "dark";
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "society-ai-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme, resolved: "light" | "dark") {
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;

    const initialTheme: Theme =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";

    const initialResolved =
      initialTheme === "system" ? getSystemTheme() : initialTheme;

    setThemeState(initialTheme);
    setResolved(initialResolved);
    applyTheme(initialTheme, initialResolved);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = (event: MediaQueryListEvent) => {
      if (cancelled) {
        return;
      }

      if (theme === "system") {
        const next = event.matches ? "dark" : "light";
        setResolved(next);
        applyTheme("system", next);
      }
    };

    media.addEventListener("change", listener);

    return () => {
      cancelled = true;
      media.removeEventListener("change", listener);
    };
    // intentionally only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);

    const nextResolved = next === "system" ? getSystemTheme() : next;

    setResolved(nextResolved);
    applyTheme(next, nextResolved);

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable in some environments.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolved, resolvedTheme: resolved, setTheme }),
    [theme, resolved, setTheme]
  );

  // Prevent hydration mismatches by rendering nothing until mounted.
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}