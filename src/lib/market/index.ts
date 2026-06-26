// Real market data: live volatility (from 30d price history) + protocol TVL/scores.
// Cached in Neon so we don't hammer public APIs; graceful fallback to static values.
import { getSql } from "@/lib/db";

const COINGECKO_ID: Record<string, string> = { SOL: "solana", ETH: "ethereum", BTC: "bitcoin" };
const STATIC_VOL: Record<string, number> = { SOL: 0.85, ETH: 0.72, BTC: 0.58 };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h

async function fetchVolFromHistory(asset: string): Promise<{ price: number; vol: number } | null> {
  const id = COINGECKO_ID[asset];
  if (!id) return null;
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`,
      { headers: { accept: "application/json" } }
    );
    if (!r.ok) return null;
    const j = (await r.json()) as { prices: [number, number][] };
    const px = (j.prices || []).map((p) => p[1]).filter((x) => x > 0);
    if (px.length < 5) return null;
    const rets: number[] = [];
    for (let i = 1; i < px.length; i++) rets.push(Math.log(px[i] / px[i - 1]));
    const mean = rets.reduce((s, x) => s + x, 0) / rets.length;
    const variance = rets.reduce((s, x) => s + (x - mean) * (x - mean), 0) / rets.length;
    const vol = Math.sqrt(variance) * Math.sqrt(365); // annualized
    return { price: px[px.length - 1], vol };
  } catch {
    return null;
  }
}

// Returns live (cached) annualized volatility for an asset, falling back to static.
export async function getAssetVol(asset: string): Promise<{ vol: number; price: number | null; live: boolean }> {
  const sql = getSql();
  if (sql) {
    try {
      const rows = (await sql`SELECT vol, price, updated_at FROM market WHERE asset = ${asset}`) as { vol: number; price: number; updated_at: string }[];
      const row = rows[0];
      if (row && Date.now() - new Date(row.updated_at).getTime() < CACHE_TTL_MS) {
        return { vol: Number(row.vol), price: Number(row.price), live: true };
      }
    } catch { /* fall through to fetch */ }
  }
  const fetched = await fetchVolFromHistory(asset);
  if (fetched) {
    if (sql) {
      try {
        await sql`INSERT INTO market (asset, price, vol, updated_at) VALUES (${asset}, ${fetched.price}, ${fetched.vol}, now())
          ON CONFLICT (asset) DO UPDATE SET price = EXCLUDED.price, vol = EXCLUDED.vol, updated_at = now()`;
      } catch { /* ignore cache write errors */ }
    }
    return { vol: fetched.vol, price: fetched.price, live: true };
  }
  return { vol: STATIC_VOL[asset] ?? 0.85, price: null, live: false };
}

// ── Protocol scoring from real TVL (DeFiLlama) + static qualitative components ──
const PROTOS = [
  { name: "Kamino", slug: "kamino-lend", audits: 2, incidents: 0, leg: "safe" },
  { name: "Jupiter Perps", slug: "jupiter-perpetual-exchange", audits: 1, incidents: 1, leg: "growth" },
  { name: "Marinade", slug: "marinade-finance", audits: 2, incidents: 0, leg: "safe" },
  { name: "Drift", slug: "drift-protocol", audits: 1, incidents: 1, leg: "growth" },
  { name: "Solend", slug: "solend", audits: 1, incidents: 2, leg: "safe" },
];

async function fetchTvl(slug: string): Promise<number | null> {
  try {
    const r = await fetch(`https://api.llama.fi/tvl/${slug}`);
    if (!r.ok) return null;
    const v = await r.json();
    return typeof v === "number" ? v : null;
  } catch {
    return null;
  }
}

function scoreFor(tvl: number | null, audits: number, incidents: number): number {
  const auditPts = Math.min(30, audits * 15);
  const tvlPts = tvl == null ? 12 : Math.min(25, Math.round((Math.log10(Math.max(tvl, 1)) / 9.5) * 25));
  const agePts = 18;
  const incidentPts = Math.max(0, 15 - incidents * 7);
  const insurancePts = 9;
  return auditPts + tvlPts + agePts + incidentPts + insurancePts;
}

export async function getProtocols(): Promise<Array<{ name: string; tvl: number | null; score: number; leg: string; live: boolean }>> {
  const out = await Promise.all(
    PROTOS.map(async (p) => {
      const tvl = await fetchTvl(p.slug);
      return { name: p.name, tvl, score: scoreFor(tvl, p.audits, p.incidents), leg: p.leg, live: tvl != null };
    })
  );
  return out;
}
