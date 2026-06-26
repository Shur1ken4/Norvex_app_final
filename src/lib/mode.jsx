"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Global Lite/Pro experience mode. Lite = guided minimal path; Pro = everything
// expanded inline. Persisted in localStorage, mirrors the CurrencyProvider pattern.
const MODES = { lite: true, pro: true };
const DEFAULT = "lite";

const Ctx = createContext({
  mode: DEFAULT,
  isPro: false,
  setMode: () => {},
  toggle: () => {},
});

// Mirror the theme provider: reflect the active mode onto <html> so a Pro-only
// "blueprint depth" skin can be applied app-wide via [data-mode="pro"] in CSS,
// with no per-component changes.
function applyMode(m) {
  if (typeof document === "undefined") return;
  if (m === "pro") document.documentElement.setAttribute("data-mode", "pro");
  else document.documentElement.removeAttribute("data-mode");
}

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(DEFAULT);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = localStorage.getItem("norvex_mode");
    if (m && MODES[m]) setModeState(m);
  }, []);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const setMode = useCallback((m) => {
    if (!MODES[m]) return;
    setModeState(m);
    if (typeof window !== "undefined") localStorage.setItem("norvex_mode", m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((cur) => {
      const next = cur === "pro" ? "lite" : "pro";
      if (typeof window !== "undefined") localStorage.setItem("norvex_mode", next);
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ mode, isPro: mode === "pro", setMode, toggle }}>{children}</Ctx.Provider>;
}

export function useMode() {
  return useContext(Ctx);
}
