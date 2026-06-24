"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

const storageKey = "sipandu-theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem(storageKey);

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <button
        aria-label="Memuat tema"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition",
          className,
        )}
        type="button"
        disabled
      >
        <span className="h-4 w-4" aria-hidden />
        {showLabel ? <span className="opacity-0">Mode terang</span> : null}
      </button>
    );
  }

  return (
    <button
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-accent" aria-hidden />
      ) : (
        <Moon className="h-4 w-4 text-primary" aria-hidden />
      )}
      {showLabel ? <span>{isDark ? "Mode terang" : "Mode gelap"}</span> : null}
    </button>
  );
}
