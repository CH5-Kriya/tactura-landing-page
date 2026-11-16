"use client";

import { useEffect, useState } from "react";
import { themePreference, themeStorageKey, type ThemePreference } from "@/lib/theme";

function applyTheme(preference: ThemePreference, systemDark: boolean) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = preference === "system"
    ? (systemDark ? "dark" : "light")
    : preference;
}

export function ThemeSelect() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const root = document.documentElement;
    const sync = () => {
      const current = themePreference(root.dataset.themePreference);
      applyTheme(current, system.matches);
      setPreference(current);
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== themeStorageKey && event.key !== null) return;
      root.dataset.themePreference = themePreference(event.newValue);
      sync();
    };

    sync();
    system.addEventListener("change", sync);
    window.addEventListener("storage", syncStorage);
    return () => {
      system.removeEventListener("change", sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  function changeTheme(value: string) {
    const next = themePreference(value);
    applyTheme(next, window.matchMedia("(prefers-color-scheme: dark)").matches);
    setPreference(next);
    try {
      window.localStorage.setItem(themeStorageKey, next);
    } catch {
      // The current page can still use the selected theme.
    }
  }

  return (
    <label className="theme-select">
      Theme
      <select value={preference} onChange={(event) => changeTheme(event.target.value)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
