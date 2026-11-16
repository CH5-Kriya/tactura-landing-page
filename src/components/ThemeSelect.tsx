"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { themePreference, themeStorageKey, type ThemePreference } from "@/lib/theme";

function applyTheme(preference: ThemePreference, systemDark: boolean) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = preference === "system"
    ? (systemDark ? "dark" : "light")
    : preference;
}

const choices = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export function ThemeSelect() {
  const disclosure = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
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

    const closeOutside = (event: PointerEvent) => {
      const menu = disclosure.current;
      if (menu && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    };

    sync();
    document.addEventListener("pointerdown", closeOutside);
    system.addEventListener("change", sync);
    window.addEventListener("storage", syncStorage);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
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

  function closeMenu() {
    trigger.current?.focus();
    if (disclosure.current) disclosure.current.open = false;
  }

  return (
    <details
      ref={disclosure}
      className="theme-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          event.currentTarget.open = false;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && event.currentTarget.open) {
          event.stopPropagation();
          closeMenu();
        }
      }}
    >
      <summary
        ref={trigger}
        aria-label={`Theme (${choices.find(({ value }) => value === preference)?.label})`}
      >
        <Moon className="theme-moon" size={21} aria-hidden="true" />
        <Sun className="theme-sun" size={21} aria-hidden="true" />
      </summary>
      <div className="theme-options" role="group" aria-label="Choose a theme">
        {choices.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            aria-pressed={preference === value}
            onClick={() => {
              changeTheme(value);
              closeMenu();
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}
