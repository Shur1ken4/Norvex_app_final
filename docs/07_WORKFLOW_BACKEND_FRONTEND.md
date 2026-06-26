# 07 — Backend & Frontend Workflow (step by step)

## A) Build-a-portfolio flow (the core loop)
**Frontend → Backend → Frontend**, end to end:

1. **Goal page** (`screens.jsx` `GoalInput`) — user types a goal / picks asset+amount. On "Build", the
   goal text + chosen asset are saved to `sessionStorage` and the app routes to `/building`.
2. **Building page** (`Building`) — on mount it shows the pipeline animation **and** calls
   `POST /api/brain` with `{ goal, asset, wallet_address }`. It waits for both the animation and the
   real response, stores the result in `sessionStorage` (`norvex_brain`), then routes to `/preview`.
3. **Orchestrator** (`/api/brain/route.ts`):
   - `getActiveConfig()` (Neon) → current growth cap.
   - `parseGoal()` → Claude (AI Gateway) → structured params (fallback: regex parser if LLM down).
   - `getAssetVol()` (`src/lib/market`) → live volatility (cached in Neon).
   - `computeAllocation()` + Monte-Carlo VaR sweep → growth ceiling.
   - `runDebate()` → Claude Sonnet → growth %, **clamped** to the ceiling.
   - Final Monte-Carlo + stress tests → `validate()` (6 guardrails).
   - Returns `{ allocation, scenarios, mc, debate, guardrails, reasoning, maxLossUsd, cost, latency, mode }`.
   - `logDecision()` → inserts a row into `decisions` (the flywheel).
4. **Preview page** (`Preview`) — reads `norvex_brain` from `sessionStorage` and renders the **real**
   allocation, scenarios, Bull/Bear/PM confidence, max loss, fee calculator, rationale, Download PDF.
5. **Deploy** — routes to `/deployed`, which `POST /api/portfolio` with the brain's amount/asset/split
   for the connected wallet → creates a `portfolios` row (and `accounts` upsert) → fires a `deploy`
   event → routes to `/dashboard`.
6. **Dashboard** (`Dashboard`) — `GET /api/portfolios?wallet=…` → lists real portfolios; selecting one
   shows value/return/split, decision history, benchmark, share/PDF; Withdraw → `POST /api/portfolio/close`.

## B) Roles / access flow
1. Tester loads any page → `proxy.ts` checks the `norvex_auth` cookie → `/login` if absent.
2. After login, default role = **user**. In Settings → Team access, entering a code →
   `POST /api/role` → sets an **httpOnly** `norvex_role` cookie (admin/b2b).
3. `src/lib/role.js` (`RoleProvider`) fetches `GET /api/role` on load → UI gates nav/menus.
4. `RoleGate` wraps `/admin`, `/system`, `/b2b` pages (client redirect if unauthorized).
5. Admin **data** endpoints (`/api/admin/*`) re-check the cookie server-side → 403 if not admin.

## C) Admin telemetry / flywheel
- Usage events (`/api/event`) and decisions (`/api/brain` → `logDecision`) accumulate in Neon.
- `GET /api/admin/analytics` aggregates TVL, revenue (via `src/lib/fees.js`), counts, usage.
- `GET /api/admin/decisions` → Brain monitor. `GET /api/backtest` → real Monte-Carlo backtests.
- Daily **Vercel Cron** (`vercel.json` → `/api/cron/update`, `CRON_SECRET`-protected) calls
  `tickPortfolios()` to evolve portfolio value/return → realized outcomes feed analytics.

## D) Strategy control plane
- `GET/POST /api/admin/config` (admin-gated) lists/saves/activates strategy versions in `config`.
- The orchestrator reads `getActiveConfig()` each request → strategy changes apply with no redeploy.

## Frontend structure
- `AppShell.jsx` = providers (Wallet → Nav → Toast → Role) + chrome (Nav, Breadcrumbs, Footer,
  FeedbackWidget, CommandPalette).
- `screens.jsx` = all screen components; pages in `src/app/(app)/*` are thin wrappers via `ScreenHost`.
- Tokens in `src/lib/constants.js` resolve to CSS variables (`globals.css`) → instant light/dark theming.
