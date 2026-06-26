// Run once after provisioning Neon and pulling env vars:
//   vercel env pull .env.local
//   node --env-file=.env.local scripts/init-db.mjs
import { neon } from "@neondatabase/serverless";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!url) {
  console.error("No DATABASE_URL / POSTGRES_URL found. Provision Neon and pull env first.");
  process.exit(1);
}

const sql = neon(url);

await sql`CREATE TABLE IF NOT EXISTS waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  referral_code text UNIQUE,
  referred_by text,
  created_at timestamp DEFAULT now(),
  position integer
)`;

await sql`CREATE TABLE IF NOT EXISTS feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address text,
  screen text,
  message text NOT NULL,
  nps_score integer,
  created_at timestamp DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS portfolios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address text,
  goal_text text,
  amount numeric,
  max_drawdown numeric,
  safe_pct numeric,
  growth_pct numeric,
  is_demo boolean DEFAULT true,
  created_at timestamp DEFAULT now()
)`;

// Round 4: extend portfolios with name/asset/value/return/status/origin.
await sql`ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS name text`;
await sql`ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS asset text DEFAULT 'SOL'`;
await sql`ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS value numeric`;
await sql`ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS return_pct numeric`;
await sql`ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'`;
await sql`ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS origin text DEFAULT 'consumer'`;

// Round 4: accounts (role + demo flag) and usage events.
await sql`CREATE TABLE IF NOT EXISTS accounts (
  wallet_address text PRIMARY KEY,
  role text DEFAULT 'user',
  is_demo boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  last_seen timestamp DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address text,
  type text NOT NULL,
  screen text,
  meta jsonb,
  created_at timestamp DEFAULT now()
)`;

// Round 5: AI brain decision log (the flywheel substrate).
await sql`CREATE TABLE IF NOT EXISTS decisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address text,
  goal text,
  parsed jsonb,
  allocation jsonb,
  mc jsonb,
  transcript jsonb,
  guardrails_passed integer,
  cost numeric,
  latency_ms integer,
  model text,
  created_at timestamp DEFAULT now()
)`;

// Round 5.2: market data cache (live volatility/price per asset).
await sql`CREATE TABLE IF NOT EXISTS market (
  asset text PRIMARY KEY,
  price numeric,
  vol numeric,
  updated_at timestamp DEFAULT now()
)`;

// Round 5.5: versioned strategy config (the control plane). Seed v1 (25% cap) active.
await sql`CREATE TABLE IF NOT EXISTS config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  version integer,
  growth_cap numeric DEFAULT 0.25,
  note text,
  active boolean DEFAULT false,
  created_at timestamp DEFAULT now()
)`;
await sql`INSERT INTO config (version, growth_cap, note, active)
  SELECT 1, 0.25, 'Initial strategy (25% growth cap)', true
  WHERE NOT EXISTS (SELECT 1 FROM config)`;

console.log("✓ Tables ready: waitlist, feedback, portfolios (+cols), accounts, events, decisions, market, config");
