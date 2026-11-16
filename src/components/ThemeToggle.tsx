"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { themePreference, themeStorageKey, type ThemePreference } from "@/lib/theme";

function applyTheme(preference: ThemePreference, systemDark: boolean) {
  const dark = preference === "system" ? systemDark : preference === "dark";
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = dark ? "dark" : "light";
  return dark;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const root = document.documentElement;
    const sync = () => {
      setDark(applyTheme(themePreference(root.dataset.themePreference), system.matches));
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== themeStorageKey && event.key !== null) return;
      setDark(applyTheme(themePreference(event.newValue), system.matches));
    };

    sync();
    system.addEventListener("change", sync);
    window.addEventListener("storage", syncStorage);
    return () => {
      system.removeEventListener("change", sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setDark(applyTheme(next, false));
    try {
      window.localStorage.setItem(themeStorageKey, next);
    } catch {
      // The current page can still use the selected theme.
    }
  }

  return (
    <button type="button" className="theme-toggle" aria-label="Dark mode" aria-pressed={dark} onClick={toggleTheme}>
      <Moon className="theme-moon" size={21} aria-hidden="true" />
      <Sun className="theme-sun" size={21} aria-hidden="true" />
    </button>
  );
}
