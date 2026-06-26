import { neon } from "@neondatabase/serverless";
import { norvexRevenue, mgmtFee, perfFee } from "./fees";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

// Returns a Neon SQL client, or null when no database is configured.
// Callers must treat null as "DB not provisioned yet" and degrade gracefully.
export function getSql() {
  if (!url) return null;
  return neon(url);
}

export const dbConfigured = Boolean(url);

// A base offset so the first real signup reads as a believable position.
const WAITLIST_BASE = 246;

function makeRefCode(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function addToWaitlist(
  email: string,
  referredBy?: string | null
): Promise<{ position: number; stored: boolean; referral_code: string | null; referrals: number }> {
  const sql = getSql();
  if (!sql) return { position: WAITLIST_BASE + 1, stored: false, referral_code: null, referrals: 0 };

  const code = makeRefCode();
  // Insert with a generated referral code; keep the existing code on conflict.
  await sql`INSERT INTO waitlist (email, referral_code, referred_by)
    VALUES (${email}, ${code}, ${referredBy ?? null})
    ON CONFLICT (email) DO UPDATE SET referred_by = COALESCE(waitlist.referred_by, EXCLUDED.referred_by)`;

  const meRows = (await sql`SELECT referral_code FROM waitlist WHERE email = ${email}`) as { referral_code: string | null }[];
  const referral_code = meRows[0]?.referral_code ?? code;

  const countRows = (await sql`SELECT count(*)::int AS n FROM waitlist`) as { n: number }[];
  const position = WAITLIST_BASE + (countRows[0]?.n ?? 0);

  const refRows = (await sql`SELECT count(*)::int AS n FROM waitlist WHERE referred_by = ${referral_code}`) as { n: number }[];
  const referrals = refRows[0]?.n ?? 0;

  return { position, stored: true, referral_code, referrals };
}

export async function addFeedback(input: {
  wallet_address?: string | null;
  screen?: string | null;
  message: string;
  nps_score?: number | null;
}): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await sql`INSERT INTO feedback (wallet_address, screen, message, nps_score)
    VALUES (${input.wallet_address ?? null}, ${input.screen ?? null}, ${input.message}, ${input.nps_score ?? null})`;
  return true;
}

export async function addPortfolio(input: {
  wallet_address?: string | null;
  goal_text?: string | null;
  amount?: number | null;
  max_drawdown?: number | null;
  safe_pct?: number | null;
  growth_pct?: number | null;
  is_demo?: boolean;
}): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await sql`INSERT INTO portfolios (wallet_address, goal_text, amount, max_drawdown, safe_pct, growth_pct, is_demo)
    VALUES (${input.wallet_address ?? null}, ${input.goal_text ?? null}, ${input.amount ?? null},
            ${input.max_drawdown ?? null}, ${input.safe_pct ?? null}, ${input.growth_pct ?? null},
            ${input.is_demo ?? true})`;
  return true;
}

// ── Round 4: accounts, multi-portfolio CRUD, events, admin aggregates ──

export interface Portfolio {
  id: string;
  wallet_address: string | null;
  name: string | null;
  asset: string | null;
  goal_text: string | null;
  amount: number | null;
  value: number | null;
  return_pct: number | null;
  max_drawdown: number | null;
  safe_pct: number | null;
  growth_pct: number | null;
  status: string | null;
  origin: string | null;
  is_demo: boolean | null;
  created_at: string;
}

export async function upsertAccount(wallet: string, isDemo: boolean): Promise<void> {
  const sql = getSql();
  if (!sql || !wallet) return;
  await sql`INSERT INTO accounts (wallet_address, is_demo, last_seen)
    VALUES (${wallet}, ${isDemo}, now())
    ON CONFLICT (wallet_address) DO UPDATE SET last_seen = now()`;
}

export async function getRoleForWallet(wallet: string): Promise<string> {
  const sql = getSql();
  if (!sql || !wallet) return "user";
  const rows = (await sql`SELECT role FROM accounts WHERE wallet_address = ${wallet}`) as { role: string }[];
  return rows[0]?.role ?? "user";
}

export async function createPortfolio(input: {
  wallet_address: string;
  name?: string | null;
  asset?: string | null;
  goal_text?: string | null;
  amount?: number | null;
  max_drawdown?: number | null;
  safe_pct?: number | null;
  growth_pct?: number | null;
  origin?: string | null;
  is_demo?: boolean;
}): Promise<{ id: string | null; stored: boolean }> {
  const sql = getSql();
  if (!sql) return { id: null, stored: false };
  await upsertAccount(input.wallet_address, input.is_demo ?? true);
  const amount = input.amount ?? 0;
  // Seed a small positive demo return so dashboards/revenue look alive.
  const ret = Math.round((Math.random() * 4 + 0.5) * 100) / 100;
  const value = Math.round(amount * (1 + ret / 100) * 100) / 100;
  const rows = (await sql`INSERT INTO portfolios
    (wallet_address, name, asset, goal_text, amount, value, return_pct, max_drawdown, safe_pct, growth_pct, origin, is_demo, status)
    VALUES (${input.wallet_address}, ${input.name ?? "Portfolio"}, ${input.asset ?? "SOL"},
            ${input.goal_text ?? null}, ${amount}, ${value}, ${ret},
            ${input.max_drawdown ?? null}, ${input.safe_pct ?? 92}, ${input.growth_pct ?? 8},
            ${input.origin ?? "consumer"}, ${input.is_demo ?? true}, 'active')
    RETURNING id`) as { id: string }[];
  return { id: rows[0]?.id ?? null, stored: true };
}

export async function listPortfolios(wallet: string): Promise<Portfolio[]> {
  const sql = getSql();
  if (!sql || !wallet) return [];
  return (await sql`SELECT * FROM portfolios WHERE wallet_address = ${wallet} ORDER BY created_at DESC`) as Portfolio[];
}

export async function closePortfolio(id: string, wallet: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await sql`UPDATE portfolios SET status = 'closed' WHERE id = ${id} AND wallet_address = ${wallet}`;
  return true;
}

export async function logDecision(input: {
  wallet_address?: string | null;
  goal?: string | null;
  parsed?: unknown;
  allocation?: unknown;
  mc?: unknown;
  transcript?: unknown;
  guardrails_passed?: number;
  cost?: number;
  latency_ms?: number;
  model?: string;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`INSERT INTO decisions (wallet_address, goal, parsed, allocation, mc, transcript, guardrails_passed, cost, latency_ms, model)
    VALUES (${input.wallet_address ?? null}, ${input.goal ?? null}, ${JSON.stringify(input.parsed ?? {})},
            ${JSON.stringify(input.allocation ?? {})}, ${JSON.stringify(input.mc ?? {})}, ${JSON.stringify(input.transcript ?? {})},
            ${input.guardrails_passed ?? null}, ${input.cost ?? null}, ${input.latency_ms ?? null}, ${input.model ?? null})`;
}

export async function recentDecisions(limit = 20): Promise<Array<Record<string, unknown>>> {
  const sql = getSql();
  if (!sql) return [];
  return (await sql`SELECT * FROM decisions ORDER BY created_at DESC LIMIT ${limit}`) as Array<Record<string, unknown>>;
}

export async function logEvent(input: {
  wallet_address?: string | null;
  type: string;
  screen?: string | null;
  meta?: unknown;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`INSERT INTO events (wallet_address, type, screen, meta)
    VALUES (${input.wallet_address ?? null}, ${input.type}, ${input.screen ?? null}, ${JSON.stringify(input.meta ?? {})})`;
}

// ── Round 5.5: versioned strategy config (control plane) ──
export async function getActiveConfig(): Promise<{ growthCap: number; version: number }> {
  const sql = getSql();
  if (!sql) return { growthCap: 0.25, version: 1 };
  try {
    const rows = (await sql`SELECT version, growth_cap FROM config WHERE active = true ORDER BY version DESC LIMIT 1`) as { version: number; growth_cap: number }[];
    if (rows[0]) return { growthCap: Number(rows[0].growth_cap), version: rows[0].version };
  } catch { /* fall through */ }
  return { growthCap: 0.25, version: 1 };
}

export async function listConfigs(): Promise<Array<Record<string, unknown>>> {
  const sql = getSql();
  if (!sql) return [];
  return (await sql`SELECT * FROM config ORDER BY version DESC`) as Array<Record<string, unknown>>;
}

export async function saveConfig(growthCap: number, note: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  const rows = (await sql`SELECT COALESCE(max(version),0)::int AS v FROM config`) as { v: number }[];
  const version = (rows[0]?.v ?? 0) + 1;
  await sql`INSERT INTO config (version, growth_cap, note, active) VALUES (${version}, ${growthCap}, ${note}, false)`;
}

export async function activateConfig(id: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE config SET active = false WHERE active = true`;
  await sql`UPDATE config SET active = true WHERE id = ${id}`;
}

// Simulated "market tick" — nudges each active portfolio's value/return so the
// flywheel shows realized outcomes evolving over time (cron-driven).
export async function tickPortfolios(): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  const rows = (await sql`
    UPDATE portfolios p
    SET value = nv.v, return_pct = (nv.v / NULLIF(p.amount, 0) - 1) * 100
    FROM (
      SELECT id, GREATEST(1, COALESCE(value, amount) * (1 + (random() - 0.45) * 0.012)) AS v
      FROM portfolios WHERE status IS DISTINCT FROM 'closed'
    ) nv
    WHERE p.id = nv.id
    RETURNING p.id`) as { id: string }[];
  return rows.length;
}

export async function adminAnalytics(): Promise<{
  configured: boolean;
  tvl: number;
  revenue: { mgmt: number; perf: number; total: number };
  counts: { portfolios: number; real: number; demo: number; accounts: number };
  avgReturn: number;
  usage: { sessions: number; sims: number; deploys: number; total: number };
  accounts: Array<Record<string, unknown>>;
  portfolios: Array<Record<string, unknown>>;
}> {
  const sql = getSql();
  const empty = {
    configured: false,
    tvl: 0,
    revenue: { mgmt: 0, perf: 0, total: 0 },
    counts: { portfolios: 0, real: 0, demo: 0, accounts: 0 },
    avgReturn: 0,
    usage: { sessions: 0, sims: 0, deploys: 0, total: 0 },
    accounts: [] as Array<Record<string, unknown>>,
    portfolios: [] as Array<Record<string, unknown>>,
  };
  if (!sql) return empty;

  const pfs = (await sql`SELECT * FROM portfolios WHERE status IS DISTINCT FROM 'closed'`) as Portfolio[];
  let tvl = 0, mgmt = 0, perf = 0, total = 0, retSum = 0, real = 0, demo = 0;
  for (const pf of pfs) {
    const value = Number(pf.value ?? pf.amount ?? 0);
    tvl += value;
    const days = pf.created_at ? Math.max(1, (Date.now() - new Date(pf.created_at).getTime()) / 86400000) : 365;
    const gain = value * Math.max(0, Number(pf.return_pct ?? 0) / 100);
    mgmt += mgmtFee(value, days);
    perf += perfFee(gain);
    total += norvexRevenue(pf);
    retSum += Number(pf.return_pct ?? 0);
    if (pf.is_demo) demo++; else real++;
  }
  const accountsRows = (await sql`SELECT a.wallet_address, a.role, a.is_demo, a.last_seen,
      count(p.id)::int AS portfolios,
      COALESCE(sum(p.value),0)::float AS total_value
    FROM accounts a LEFT JOIN portfolios p ON p.wallet_address = a.wallet_address
    GROUP BY a.wallet_address, a.role, a.is_demo, a.last_seen
    ORDER BY a.last_seen DESC LIMIT 200`) as Array<Record<string, unknown>>;
  const acctCount = (await sql`SELECT count(*)::int AS n FROM accounts`) as { n: number }[];
  const ev = (await sql`SELECT type, count(*)::int AS n FROM events GROUP BY type`) as { type: string; n: number }[];
  const evMap: Record<string, number> = {};
  let evTotal = 0;
  for (const e of ev) { evMap[e.type] = e.n; evTotal += e.n; }

  return {
    configured: true,
    tvl: Math.round(tvl),
    revenue: { mgmt: Math.round(mgmt), perf: Math.round(perf), total: Math.round(total) },
    counts: { portfolios: pfs.length, real, demo, accounts: acctCount[0]?.n ?? 0 },
    avgReturn: pfs.length ? Math.round((retSum / pfs.length) * 100) / 100 : 0,
    usage: { sessions: evMap["view"] ?? 0, sims: evMap["sim_run"] ?? 0, deploys: evMap["deploy"] ?? 0, total: evTotal },
    accounts: accountsRows,
    portfolios: pfs as unknown as Array<Record<string, unknown>>,
  };
}
