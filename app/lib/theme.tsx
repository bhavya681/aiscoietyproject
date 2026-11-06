"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
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

const subscribeToMount = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  } catch {
    return "system";
  }
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    resolveTheme(getInitialTheme())
  );
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientMounted,
    getServerMounted
  );

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = (event: MediaQueryListEvent) => {
      setResolved(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setResolved(resolveTheme(next));

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

  // Avoid a hydration mismatch while the client theme is resolved.
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
