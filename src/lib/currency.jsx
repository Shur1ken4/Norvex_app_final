"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const SYMBOLS = { EUR: "€", USD: "$", GBP: "£" };
const NAMES = { EUR: "Euro", USD: "US Dollar", GBP: "Pound Sterling" };
const DEFAULT = "EUR";

const Ctx = createContext({
  code: DEFAULT,
  symbol: SYMBOLS[DEFAULT],
  setCode: () => {},
  format: (n) => SYMBOLS[DEFAULT] + Math.round(Number(n) || 0).toLocaleString(),
  formatK: (n) => SYMBOLS[DEFAULT] + Math.round(Number(n) || 0).toLocaleString(),
});

export function CurrencyProvider({ children }) {
  const [code, setCodeState] = useState(DEFAULT);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = localStorage.getItem("norvex_currency");
    if (c && SYMBOLS[c]) setCodeState(c);
  }, []);

  const setCode = useCallback((c) => {
    if (!SYMBOLS[c]) return;
    setCodeState(c);
    if (typeof window !== "undefined") localStorage.setItem("norvex_currency", c);
  }, []);

  const symbol = SYMBOLS[code];
  const format = useCallback((n) => symbol + Math.round(Number(n) || 0).toLocaleString(), [symbol]);
  const formatK = useCallback((n) => {
    const v = Number(n) || 0;
    if (Math.abs(v) >= 1e9) return symbol + (v / 1e9).toFixed(1) + "B";
    if (Math.abs(v) >= 1e6) return symbol + (v / 1e6).toFixed(1) + "M";
    if (Math.abs(v) >= 1e3) return symbol + (v / 1e3).toFixed(v >= 1e4 ? 0 : 1) + "K";
    return symbol + Math.round(v).toLocaleString();
  }, [symbol]);

  return <Ctx.Provider value={{ code, symbol, setCode, format, formatK }}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  return useContext(Ctx);
}

export const CURRENCIES = Object.keys(SYMBOLS).map((code) => ({ code, symbol: SYMBOLS[code], name: NAMES[code] }));
