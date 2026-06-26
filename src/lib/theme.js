"use client";
import { useState, useEffect, useCallback } from "react";

export function applyTheme(t) {
  if (typeof document === "undefined") return;
  if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
}

// Lightweight theme hook. Instances stay in sync via a window event so the nav
// toggle and the command palette reflect each other immediately.
export function useTheme() {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const t = localStorage.getItem("norvex_theme") || "light";
    setThemeState(t);
    const h = (e) => setThemeState(e.detail);
    window.addEventListener("norvex-theme", h);
    return () => window.removeEventListener("norvex-theme", h);
  }, []);

  const setTheme = useCallback((t) => {
    localStorage.setItem("norvex_theme", t);
    applyTheme(t);
    setThemeState(t);
    window.dispatchEvent(new CustomEvent("norvex-theme", { detail: t }));
  }, []);

  const toggle = useCallback(() => {
    const current = localStorage.getItem("norvex_theme") || "light";
    setTheme(current === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggle };
}
