"use client";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNav } from "../lib/nav";

// Syncs the real Solana wallet connection into the app-wide nav context,
// without disturbing the mock "Try Demo" flow (which sets connected directly).
export default function WalletBridge() {
  const { connected, publicKey } = useWallet();
  const { setConnected, setAddress, clearSimulated } = useNav();

  useEffect(() => {
    if (connected && publicKey) {
      // A real wallet always wins over a simulated demo account.
      clearSimulated();
      setConnected(true);
      setAddress(publicKey.toBase58());
    }
  }, [connected, publicKey, setConnected, setAddress, clearSimulated]);

  return null;
}
