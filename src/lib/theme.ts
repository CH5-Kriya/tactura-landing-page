export const themeStorageKey = "tactura-theme";

export type ThemePreference = "system" | "light" | "dark";

export function themePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export const initializeTheme = `
(() => {
  let saved;
  try { saved = localStorage.getItem(${JSON.stringify(themeStorageKey)}); } catch {}
  const preference = saved === "light" || saved === "dark" ? saved : "system";
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = preference === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;
})();
`;
