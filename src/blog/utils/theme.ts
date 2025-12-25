/**
 * Shared theme utilities for dark mode integration.
 * Matches the landing page theme implementation in src/main.js.
 */

const THEME_KEY = "tc-theme";

export type Theme = "light" | "dark";

/**
 * Get the current theme from localStorage or system preference.
 */
export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  // Default to system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Set the theme and update DOM and localStorage.
 */
export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

/**
 * Toggle between light and dark themes.
 */
export function toggleTheme(): void {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
}

/**
 * Apply theme to the document element.
 * Matches landing page implementation.
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
}

/**
 * Initialize theme on page load.
 * Call this once when the app starts.
 */
export function initTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}
