"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const RoleCtx = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState("user");

  const refresh = useCallback(() => {
    fetch("/api/role")
      .then((r) => r.json())
      .then((d) => setRole(d.role || "user"))
      .catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Returns true on success. Used by the Settings "Team access" unlock.
  const unlock = useCallback(async (code) => {
    try {
      const r = await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!r.ok) return false;
      const d = await r.json();
      setRole(d.role || "user");
      return true;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(async () => {
    try {
      await fetch("/api/role", { method: "DELETE" });
    } catch {}
    setRole("user");
  }, []);

  return <RoleCtx.Provider value={{ role, refresh, unlock, lock }}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  return useContext(RoleCtx) || { role: "user", refresh: () => {}, unlock: async () => false, lock: async () => {} };
}
