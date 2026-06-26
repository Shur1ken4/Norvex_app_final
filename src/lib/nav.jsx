"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import { PATHS, S } from "./constants";

const NavCtx = createContext(null);

// Simulated balance shown for demo accounts (no real funds).
export const DEMO_BALANCE = { sol: 25, usdc: 10000 };

export function NavProvider({ children }) {
  const [connected, setConnectedState] = useState(false);
  const [address, setAddress] = useState(null);
  const [simulated, setSimulated] = useState(false);

  // Restore: a persistent demo account (localStorage) survives across visits;
  // otherwise restore a same-session real connection.
  useEffect(() => {
    const sim = localStorage.getItem("norvex_sim_wallet");
    if (sim) {
      setConnectedState(true);
      setAddress(sim);
      setSimulated(true);
    } else if (sessionStorage.getItem("norvex_connected") === "1") {
      setConnectedState(true);
    }
  }, []);

  const setConnected = useCallback((v) => {
    setConnectedState(v);
    if (typeof window !== "undefined") {
      if (v) sessionStorage.setItem("norvex_connected", "1");
      else {
        sessionStorage.removeItem("norvex_connected");
        setAddress(null);
      }
    }
  }, []);

  // Create a persistent demo "account" backed by a real-format Solana address.
  const createDemoWallet = useCallback(() => {
    const addr = Keypair.generate().publicKey.toBase58();
    localStorage.setItem("norvex_sim_wallet", addr);
    sessionStorage.setItem("norvex_connected", "1");
    setConnectedState(true);
    setAddress(addr);
    setSimulated(true);
    return addr;
  }, []);

  const disconnectDemo = useCallback(() => {
    localStorage.removeItem("norvex_sim_wallet");
    sessionStorage.removeItem("norvex_connected");
    setSimulated(false);
    setConnectedState(false);
    setAddress(null);
  }, []);

  // Real wallet takes precedence: clear any simulated demo state.
  const clearSimulated = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem("norvex_sim_wallet");
    setSimulated(false);
  }, []);

  return (
    <NavCtx.Provider value={{ connected, setConnected, address, setAddress, simulated, createDemoWallet, disconnectDemo, clearSimulated }}>{children}</NavCtx.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

// Shim that lets prototype components keep calling setScreen(S.X) unchanged.
export function useSetScreen() {
  const router = useRouter();
  return useCallback(
    (id) => {
      const path = PATHS[id] ?? "/";
      router.push(path);
    },
    [router]
  );
}

export { S };
