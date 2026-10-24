"use client";
import { useEffect } from "react";
import { useTheme } from "@/app/lib/theme";

export default function FaviconSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) return;
    const darkIcon = "/logo.png";
    const lightIcon = "/logo-light.png";
    link.href = resolvedTheme === "dark" ? darkIcon : lightIcon;
  }, [resolvedTheme]);

  return null;
}
