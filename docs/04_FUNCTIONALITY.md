# 04 — App Functionality (User / B2B / Admin)

Everyone first enters the **site password** (`norvex-team-2026`). Default role is **user**. Admin/B2B
tools unlock via a code in **Settings → Team access**.

## USER (default — every tester)
What a normal end-user can do:
- **Landing** → full-width dark hero card with "Your private banker. / Built by AI." (gradient text),
  3 pill CTAs (Join Waitlist / Try Demo / For Business), gradient stat chips ($7T / $100 / 24/7 /
  5-layer), 4 alternating Revolut-style feature blocks (Protected by Design / AI Builds Your
  Portfolio / Built on Solana / Compound on Autopilot), 2×2 "How it works" gradient cards,
  dark-section comparison table (Norvex vs Private Bank / Savings / Direct Crypto), 9-question FAQ,
  final gradient CTA.
- **Connect** → real Solana wallet (Phantom/Solflare on devnet) **or** "Create a demo account"
  (simulated wallet, no crypto needed — `25 SOL / $10,000` fake balance).
- **Goal / New Portfolio** (`/goal`, with its own dark hero banner) → type a plain-English goal, or
  use risk presets (Conservative / Balanced / Growth), amount quick-select ($100/$1K/$5K/$10K),
  growth-asset selector (SOL/ETH/BTC), example goals, or templates (Saver / Grower / Degen Lite /
  Wedding Fund).
- **Simulator** (own dark hero) → amount / risk / period / asset sliders, projected returns,
  Norvex-vs-Direct comparison, historical crash markers on the chart (FTX / Luna / recovery), copy
  results to clipboard.
- **Building → Preview** → the **real AI pipeline** runs (Claude debate + Monte-Carlo); Preview shows
  the real allocation, scenarios (Bull/Flat/Bear), Bull/Bear/PM confidence, max loss, fee
  calculator, "Why?" rationale.
- **Deploy → Dashboard** (dark hero with chrome backdrop) → portfolio is created and persists;
  dashboard shows value/return, safe/growth split, AI activity timeline, per-portfolio decision
  audit trail, performance-vs-benchmark, Share + PDF, multiple portfolios, withdraw.
- **History** (CSV export), **Education** (own dark hero, risk FAQ), **Settings** (editable risk slider,
  notifications/auto-compound toggles, Team-access unlock), **About**, **Changelog**.
- Global: feedback widget, NPS survey, dark mode (toggle in Nav dropdown or ⌘K), command palette
  (⌘K / `/`), breadcrumbs on inner pages.

## B2B (enter `norvex-b2b-2026`)
Unlocks the **API/B2B** section for partners (wallets, neobanks, DeFi protocols). The page opens with
its own dark hero banner showcasing the Ledger × Solana hardware-wallet imagery — sets the "we plug
into your stack" narrative immediately.
- **Overview** — value prop + **revenue calculator** (users × avg deposit → TVL, annual revenue, partner
  share, per-user revenue) + 4-week **integration timeline**.
- **Playground** — types a goal and calls the **real** `/api/brain`; shows the real response (allocation,
  scenarios, guardrails passed, **real latency + cost**) — proves the API is real.
- **White-Label** — live preview of Norvex inside 5 brand themes (Phantom/Solana/Revolut/Binance/Custom).
- **API Docs** — endpoints (create portfolio, status/NAV, withdraw, stream).
- **Pricing** — Starter/Growth/Enterprise.
- **Compliance** — MiCA-ready, KYC/AML via partner, audits, GDPR; plus **Generate Sandbox Key**
  (`nvx_test_sk_…`) and webhook toggles.

## ADMIN (enter `norvex-admin-2026`)
Unlocks the **Admin** panel + **System Docs**. Admin opens with a burgundy-swirl dark hero ("Brain
Command Center"); System Docs opens with chrome-cylinders ("Technical Architecture"). Tabs:
- **Analytics** — real TVL, # portfolios, revenue/mo, accounts, avg return, real/demo split, **usage**
  (sessions/sims/deploys) — focus-group telemetry.
- **Revenue** — management vs performance fees, total Norvex revenue, monthly run-rate, effective take rate.
- **Users** — every account (wallet, role, demo/real, # portfolios, total value, last seen); expand for detail.
- **Health** — system status incl. live DB connectivity; alert-threshold toggles.
- **Brain** — **real logged AI decisions** with debate transcripts, cost, latency, guardrails passed.
- **Backtest** — **real Monte-Carlo** across 4 strategies (Norvex vs 100% safe / 100% growth / 50-50).
- **Agents / Training / Protocols / Guardrails** — agent architecture + system prompts, A/B test surface,
  live protocol scores (real TVL), and the **Strategy Control Plane** (save/activate a growth-cap version
  that the live pipeline reads instantly).
- **System Docs** — guardrail layers, backend services, AI pipeline, USP/moat, algorithms (with pseudocode).

## Role enforcement
- Nav links + dropdown items are filtered by role; `/admin`, `/system` require admin; `/b2b` requires
  admin or B2B (redirect + toast otherwise). Admin **data** endpoints verify the httpOnly role cookie
  server-side (403 without it). Lock/sign-out of a role in Settings.
