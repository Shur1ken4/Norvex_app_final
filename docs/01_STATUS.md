# 01 — Norvex Status

**Live (private):** https://norvexapp.vercel.app
**Access:** site password `norvex-team-2026` · admin code `norvex-admin-2026` · B2B code `norvex-b2b-2026`
**Infra:** Vercel project `norvex` (team *antony-2958's projects*) · Neon Postgres · Next.js 16 · AI via
Vercel AI Gateway → Anthropic Claude. The other 5 Vercel projects (taskly, mizan×3, pro) are untouched.

## Status: LIVE & functional (one piece pending)
The MVP is genuinely functional — not a clickable mockup. Real AI, real data, real DB, real revenue
tracking, real role separation. Usable **today without any crypto** via demo simulated-wallet accounts.

### ✅ Live now
- **Real AI brain** — plain-English goal → live Claude (parse + Bull/Bear/PM debate) + deterministic
  Monte-Carlo (VaR/CVaR/Sharpe/maxDD) + 6 guardrails. LLM clamped to the math-validated risk ceiling.
- **Real market data** — live volatility (CoinGecko) feeds the Monte-Carlo; live protocol TVL
  (DeFiLlama) drives admin protocol scores. Cached in Neon, graceful fallback.
- **Roles** — user / admin / B2B via access codes (Settings → Team access).
- **Monetization tracking** — 0.75%/yr management + 10% performance; B2B 60% Norvex share. Live in admin.
- **Multi-portfolio** — real per-account portfolios (create via the flow, manage on dashboard).
- **Flywheel** — every AI decision logged; admin Brain monitor + real Monte-Carlo backtests; daily cron
  evolves portfolio outcomes.
- **Control plane** — versioned strategy config; change the growth cap live, no redeploy/retrain.
- **Demo simulated-wallet accounts** — full app usable with zero crypto.
- Polished UX: dark mode, command palette (⌘K), breadcrumbs, asset selector, referral loop, landing
  conversion sections, B2B playground/compliance/sandbox key, NPS, PDF/CSV export, changelog.
- **Round 6 design refresh (LIVE)** — full visual identity. Solana × Revolut blend: green→teal
  brand gradient on CTAs and the "Built by AI." headline word, pill-shaped buttons everywhere,
  16px-radius cards, soft elevation, warm off-white canvas with "card on canvas" framing. Landing
  has a full-width dark hero with rainbow-waves backdrop, 4 alternating Revolut-style feature blocks
  with abstract 3D imagery, a 2×2 gradient "How it works" grid, a dark glassmorphism comparison
  section, and a 9-question FAQ. Every inner page (B2B / Admin / System / Education / Dashboard /
  Simulator / Goal) has its own dark image-backed hero banner. Uniform 1240px frame across all
  routes; inner content centered at 960px. See **12_DESIGN_SYSTEM.md** for tokens, components, and
  the per-page image map.

### ⏳ Pending (the only unfinished phase)
- **On-chain devnet vault (R5.3).** Toolchain is installed (Solana 3.1.15, Anchor 1.0.2) and an Anchor
  workspace is scaffolded (`/Users/antonmatsepa/norvex/norvex_vault`). **Blocked on devnet SOL** — the
  faucet/airdrop is rate-limited and won't fund the wallet (`6eLz…CLoK`); a program deploy needs ~2–3
  SOL. Until funded, the program isn't written/deployed and the app stays on the off-chain flow.
  **This does not block using or demoing the app** (demo accounts work without crypto).

## Environment / operations
- App: `norvex-app/`. `npm run dev` (uses `.env.local`). `npm run build` → `vercel --prod`.
- DB migration (idempotent): `node --env-file=.env.local scripts/init-db.mjs`.
- Neon tables: `waitlist, feedback, portfolios, accounts, events, decisions, market, config`.
- Vercel env: `SITE_PASSWORD, ADMIN_CODE, B2B_CODE, CRON_SECRET`, Neon (`DATABASE_URL`…), AI Gateway (OIDC, auto).

## Known caveats (intentional for a focus-group MVP)
- Wallet identity isn't signature-verified (roles are "soft" via codes) — fine for a gated preview;
  hardened with sign-in-with-Solana at Go-Live.
- Backtest/return figures are model-generated (real engine, simulated price paths), not historical replays.
- On devnet, no real funds anywhere.
