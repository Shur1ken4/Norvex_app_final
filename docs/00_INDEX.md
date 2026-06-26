# Norvex — Team Handover Package

Everything the team needs to understand, run, demo, and extend Norvex.

**Live MVP:** https://norvexapp.vercel.app
**Access:** site password `norvex-team-2026` · admin code `norvex-admin-2026` · B2B code `norvex-b2b-2026`

> Testers enter the **site password** and are **users** by default. To see admin/B2B tools, enter the
> relevant code in **Settings → Team access**.

## Read in this order
1. **01_STATUS.md** — where the product stands today (what's live, what's pending).
2. **02_IMPLEMENTED.md** — everything that's been built, round by round (R1 → R6).
3. **04_FUNCTIONALITY.md** — what User / B2B / Admin can each do.
4. **05_AI_BRAIN_ARCHITECTURE.md** — the AI brain + system architecture.
5. **06_AI_BRAIN_NO_TRAINING.md** — how the brain works and why we don't "train" it.
6. **07_WORKFLOW_BACKEND_FRONTEND.md** — request flow, frontend↔backend steps.
7. **08_COMPETITORS_USP.md** — competitive landscape + Norvex's moat.
8. **12_DESIGN_SYSTEM.md** — the visual identity (Round 6: Solana × Revolut blend, tokens,
   components, image library).
9. **03_NEXT_PLAN_AND_PROMPT.md** — what's missing + a ready Claude Code prompt to continue.
10. **09_GO_LIVE_FEATURES.md** — what's needed to serve real clients with real money.
11. **10_ONBOARDING_TESTING_DEMO.md** — onboarding + testing plan + demo scripts/messages.
12. **11_MAKING_IT_REAL_AND_DEFENSIBLE.md** — the architecture thesis: 3 layers (deterministic /
    LLM / flywheel), why we don't train, how to prove it's real, competitive positioning.
13. **13_FOUNDER_PLAYBOOK.md** — the operational doc. 6-week sprint plan, weekly cadence, metrics
    targets, money model, sales playbook, decision framework, legal roadmap, hiring triggers,
    investor narrative, risk register, quarterly OKR template, common pitfalls.

## One-paragraph summary
Norvex turns a plain-English goal into an AI-built, principal-protected investment portfolio. The AI
brain is **real and live** (Claude via Vercel AI Gateway for judgment + deterministic Monte-Carlo and
guardrail math for safety). It's behind a password gate for the team/focus-group, has real role
separation (user/admin/B2B), a real database (Neon), real market data, real revenue tracking, and a
real decision-logging flywheel. Round 6 shipped the full visual identity (Solana × Revolut blend —
gradient brand accent, pill buttons, dark image-backed hero banners on every page). The only
unfinished piece is the on-chain devnet vault (blocked on devnet SOL). The app is fully usable today
**without any crypto** via demo simulated-wallet accounts.

## Tech stack at a glance
Next.js 16 (App Router) · Vercel (project `norvex`) · Neon Postgres · Vercel AI Gateway → Anthropic
Claude · Solana wallet adapter (devnet) · TypeScript Monte-Carlo engine · token-driven design system
(CSS variables for full dark-mode parity).
