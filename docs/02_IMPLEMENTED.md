# 02 — Everything Implemented (round by round)

## Phase 1 — Scaffold + deploy
Next.js 16 app, prototype ported pixel-faithfully, **app-level password gate** (`src/proxy.ts` +
`/login` + `/api/login` cookie), deployed to Vercel project `norvex` at norvexapp.vercel.app.

## Phase 2 — Real architecture
Single-file prototype split into **16 App-Router pages**, shared UI primitives (`src/components/ui.jsx`),
design tokens (`src/lib/constants.js`), nav/routing context (`src/lib/nav.jsx`).

## Phase 3 — Wallet + database
Real **Solana wallet adapter** (devnet; Phantom/Solflare + Wallet-Standard) and **Neon Postgres** with
graceful-fallback write paths (`/api/waitlist`, `/api/feedback`, `/api/portfolio`).

## Phase 4 — All 16 CRITICAL features
Demo mode, example goals, amount quick-select, Norvex-vs-Direct comparison (simulator + preview),
copy/share results, multiple-portfolio dashboard, notifications panel, B2B revenue calculator + timeline,
About page, portfolio templates, toasts, button loading states, AI confidence everywhere, NPS survey.

## Round 2 — Demo wallet + HIGH features
- **Persistent demo simulated-wallet account** (generated Solana address in localStorage, simulated
  balance, "demo" chip) — use the full app with no real wallet.
- Landing conversion trio (social proof, competitor table, FAQ), waitlist **referral loop** (Neon
  `referral_code`), **editable settings**, dashboard depth (benchmark + share + fee calculator).

## Round 3 — HIGH backlog + NICE-to-haves
**Dark mode** (token CSS variables), **command palette** (⌘K / `/`), **breadcrumbs**, **asset selector**
(SOL/ETH/BTC) + chart crash markers, B2B **compliance** tab + **sandbox key** + webhooks, admin
**Health** + **Users** tabs, per-portfolio **decision audit trail**, print-based **PDF** + **CSV** export,
"Built on Solana" badge, tutorial animation, **/changelog** page.

## Round 4 — Platform
- **Roles via access codes** (`/api/role` httpOnly cookie, `src/lib/role.js`, `RoleGate`); nav + routes
  gated; Settings "Team access" unlock.
- **Monetization model** (`src/lib/fees.js`): 0.75%/yr mgmt + 10% perf; B2B 60% Norvex share.
- **Full data model**: `accounts`, `events`, extended `portfolios` (name/asset/value/return/status/origin).
- **Real multi-portfolio** CRUD + **admin analytics** (`/api/admin/analytics`) — TVL, revenue, usage.

## Round 5 — Make the AI real (R5.1, 5.2, 5.4, 5.5 done; 5.3 pending)
- **R5.1 Real AI brain** — `src/lib/ai/agents.ts` (Claude via AI Gateway), `src/lib/quant/*`
  (Monte-Carlo, allocation, guardrails), orchestrator `src/app/api/brain/route.ts`; wired into
  Building → Preview → Deployed and the B2B playground; decisions logged.
- **R5.2 Real market data** — `src/lib/market/index.ts` (CoinGecko vol, DeFiLlama TVL), `/api/market`.
- **R5.4 Flywheel** — `/api/admin/decisions`, `/api/backtest` (real engine), `/api/cron/update` +
  `vercel.json` daily cron evolving portfolio outcomes.
- **R5.5 Control plane** — `config` table + `/api/admin/config`; admin Guardrails tab saves/activates a
  strategy version that the live pipeline reads instantly.
- **R5.3 On-chain vault** — PENDING (toolchain ready, blocked on devnet SOL). See 03_NEXT_PLAN_AND_PROMPT.md.

## Round 6 — Design refresh (Solana × Revolut blend)
Full visual identity. Brand language is now a deliberate blend of Revolut's fintech warmth (rounded
cards, generous spacing, premium type) with Solana's web3 confidence (deep dark sections, gradient
accents, abstract product imagery). All changes are token-driven so dark mode still flips with zero
per-component refactor. See **12_DESIGN_SYSTEM.md** for the full system.

- **Design tokens** — `src/lib/constants.js` + `src/app/globals.css` extended with
  `R_SM/MD/LG/XL/PILL`, `NX_1/NX_2/NX_ON/NX_GRAD` (green→teal `#16a34a → #14b8a6`), `HERO_GLOW`,
  `SHADOW_SM/MD/LG`, `PAD_SECTION/LG`.
- **Btn rewrite** (`src/components/ui.jsx`) — pill by default (`R_PILL`); new `primary` variant uses
  the brand gradient (used on Landing CTAs); `black` keeps solid; `outline` keeps neutral.
- **Card refresh** — default radius `R_LG` (16px); optional `elev` for soft shadow; optional
  `accent` prop wraps the card in a 1px gradient border.
- **Nav cleanup** — wordmark 19→24px, padding 16/20→22/28, gap 8→16; address chip is a pill with
  green dot; dropdown is `R_MD` with `SHADOW_MD`, bigger touch targets. Removed the experimental
  gradient brand-dot + "v5" tag — wordmark stands alone.
- **AppShell** — outer panel: `R_LG` corners, `SHADOW_SM`, 24px top margin → "card on canvas" feel
  over the warm off-white body (`#f7f6f3`). Nav `borderBottom` is removed on landing only.
- **Uniform frame width** — `maxWidth: 1240` everywhere (landing AND inner). Inner pages constrain
  their content to `maxWidth: 960` centered, so dashboards/forms feel readable without wasted space.
- **Landing rebuild** (`Landing` in `src/components/screens.jsx`):
  - Full-width dark hero card with rainbow-waves backdrop; "Your private banker." (white) + "Built
    by AI." (gradient text-fill); primary gradient CTA + outline pills. Title forced to 2 lines.
  - Stats row: pill chips, numerals with four distinct gradients (green-teal · indigo-teal ·
    magenta-indigo · amber-magenta).
  - **4 Revolut-style alternating feature blocks** (image one side, text the other): Protected by
    Design / AI Builds Your Portfolio / Built on Solana / Compound on Autopilot — each using a
    different abstract 3D render from `public/images/`.
  - "How it works" reshaped as **2×2 dark gradient cards** with brand-gradient mono numbers and
    soft colored radial glows.
  - "Validated by the ecosystem" section removed (consolidated).
  - **Comparison table** wrapped in a dark gradient section with iridescent-waves backdrop, teal
    radial glow, glassmorphism row cards. Each row is its own translucent card; Norvex column = a
    gradient pill badge in the header + gradient text-fill in every row.
  - **FAQ expanded 5→9 questions** in a narrow 720px centered column, circular ±26px toggle icons.
- **Page hero banners** added to: B2B (Ledger × Solana hardware shot), Admin (burgundy swirl),
  System Docs (chrome cylinders), Education (teal pills), Dashboard (chrome shell + teal glow),
  Simulator (navy spiral), Goal / New Portfolio (rainbow glass rings).
- **Image library** — 12+ abstract 3D renders in `public/images/` mapped to specific pages
  (full inventory + mood guide in `12_DESIGN_SYSTEM.md`).
- Mobile: feature blocks stack image-on-top at ≤720px; How-It-Works grid collapses to single column.
- Bug fix: removed duplicate tab row on B2B page; fixed hero gradient-text descender clipping by
  adding `line-height: 1.15` + `padding-bottom: 0.12em` on the gradient span.

## Key files map
- AI: `src/lib/ai/agents.ts` · Quant: `src/lib/quant/{montecarlo,allocate,guardrails,assets}.ts`
- Orchestrator: `src/app/api/brain/route.ts` · Market: `src/lib/market/index.ts`
- DB: `src/lib/db.ts` + `scripts/init-db.mjs` · Fees: `src/lib/fees.js`
- Roles: `src/lib/role.js`, `src/components/RoleGate.jsx`, `src/app/api/role/route.ts`
- Screens: `src/components/screens.jsx` (all 16+ screens) · Shell: `src/components/AppShell.jsx`
- API routes: `src/app/api/{brain,market,backtest,role,portfolio,portfolios,portfolio/close,event,waitlist,feedback,admin/analytics,admin/decisions,admin/config,cron/update}/route.ts`
