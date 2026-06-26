# 05 — AI Brain & System Architecture

## The 7-agent brain (3 LLM + 4 deterministic)
The core design principle: **only the judgment steps use an LLM; the safety-critical steps are
deterministic math.** That's what makes the principal-protection guarantee provable and defensible.

| # | Agent | Type | Role | Where |
|---|-------|------|------|-------|
| 1 | NLP Parser | **LLM** (Claude Haiku) | goal text → `{amount, asset, maxDd, risk, horizon}` | `src/lib/ai/agents.ts` |
| 2 | Market Analyst | Deterministic | live prices/vol/yields | `src/lib/market/index.ts` |
| 3 | Risk Engine | Deterministic | Monte-Carlo (GBM + jump diffusion) → VaR/CVaR/Sharpe/maxDD | `src/lib/quant/montecarlo.ts` |
| 4 | Bull/Bear/PM | **LLM** (Claude Sonnet) | debate growth %, **clamped** to the MC ceiling | `src/lib/ai/agents.ts` |
| 5 | Allocator | Deterministic | risk-budget split + 25% cap | `src/lib/quant/allocate.ts` |
| 6 | Guardrail Validator | Deterministic | 6 checks; all must pass | `src/lib/quant/guardrails.ts` |
| 7 | PM Explainer | **LLM** (rationale) | plain-English "why" | reused from the debate output |

The **orchestrator** (`src/app/api/brain/route.ts`) runs them in order and logs every decision.

## The 6 guardrails (deterministic, all must pass)
1. Growth cap (≤ active strategy cap, default 25%) 2. VaR95 ≤ user max-drawdown 3. Stress −50% within
limit 4. Stress −80% within limit 5. Exploit/CVaR check 6. Protocol safety (min score ≥ 60).
The LLM **cannot** override these — if the debate proposes more growth than the Monte-Carlo-validated
ceiling, the code clamps it down.

## System layers
```
Frontend (Next.js App Router, src/components/screens.jsx + AppShell)
   │  fetch
Route handlers (src/app/api/*)  ── role-gated (httpOnly cookie) for admin/B2B
   │
AI brain orchestrator (/api/brain)
   ├─ LLM agents  → Vercel AI Gateway → Anthropic Claude   (judgment)
   ├─ Quant engines (TypeScript, deterministic)            (safety/ math)
   └─ Market data (CoinGecko / DeFiLlama, cached in Neon)  (inputs)
   │
Neon Postgres  (accounts, portfolios, decisions, events, config, market, waitlist, feedback)
   │
(Pending) Solana devnet — Anchor vault enforcing the guardrail invariant on-chain
```

## Data model (Neon tables)
- `accounts` — wallet, role, is_demo, last_seen
- `portfolios` — owner, name, asset, amount, value, return_pct, safe/growth %, status, origin (consumer/b2b), is_demo
- `decisions` — goal, parsed params, allocation, mc results, debate transcript, guardrails passed, cost, latency, model
- `events` — usage telemetry (view / sim_run / deploy / create / close / feedback)
- `config` — versioned strategy (growth_cap, active flag) → read by the live pipeline
- `market` — cached price/vol per asset
- `waitlist` (+ referral_code), `feedback` (+ nps_score)

## Monetization model (tracked in admin)
`src/lib/fees.js`: management **0.75%/yr** on AUM + **10%** performance fee on gains. B2B-origin
portfolios are revenue-shared **60% to Norvex / 40% to the partner**. Admin Analytics/Revenue compute
these live from the portfolios table.

## LLM connection
Already connected and live in production via **Vercel AI Gateway** using the project's OIDC (no API key
to manage). Models: `anthropic/claude-haiku-4.5` (parse) and `anthropic/claude-sonnet-4.6` (debate).
Switch/add a model = change the model string in `src/lib/ai/agents.ts`. Cost/latency visible in the
Gateway dashboard and logged per decision.
