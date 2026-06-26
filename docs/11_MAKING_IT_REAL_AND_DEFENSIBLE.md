# 11 — Making Norvex Real & Defensible (the architecture thesis)

> The most important thing first: **you don't "train" most of Norvex, and trying to fine-tune a model
> to make the investment decision would actually weaken the moat and create a regulatory/reliability
> problem.** The design (from the prototype's own System Docs) is correct: **only 3 of the 7 agents use
> an LLM; the 4 safety-critical ones are deterministic.** That split is the key to everything below.

## The 3 layers of "making it real"

### Layer 1 — Deterministic engines (the part you guarantee & defend). No AI / no training.
These are the agents that are **math + code**, not judgment:
- **Risk Engine** → real Monte Carlo (GBM + jump diffusion), real VaR / CVaR. Pure computation:
  testable, reproducible, auditable.
- **Market Analyst** → real feeds: Pyth (prices), DeFiLlama (yields/TVL), Jupiter (funding). Cached in Neon.
- **Protocol Scorer** → real scoring from real audit / TVL / incident data → becomes a **proprietary
  protocol-risk database** (a real moat).
- **Guardrail Validator** → the **6 deterministic checks**, **re-asserted on-chain** in the Solana vault
  (Anchor): `growth ≤ max_loss_budget`, isolated vaults, etc.

This layer is what lets you say *"we guarantee principal protection"* — because it's enforced by **math
and on-chain code**, not a model's promise. **This is the defensible IP investors and partners can verify.**

### Layer 2 — LLM agents (judgment, not math). Call Claude / OpenAI via API. Do **NOT** fine-tune yet.
- **NLP Parser** (cheap model, e.g. Haiku): goal text → structured JSON via structured outputs / tool calling.
- **Bull / Bear + PM debate** (stronger model, e.g. Sonnet): the multi-agent debate — but the PM's
  decision is **clamped by the deterministic Monte Carlo + guardrails**. The LLM literally cannot exceed
  your VaR limit; if it tries, the math overrides it.
- **PM Explainer**: plain-English rationale + scenario cards.

**"Making these real" = wiring the existing playground/brain UI to actual API calls** (via Vercel AI SDK
+ AI Gateway for routing, failover, cost/latency tracking, caching). **"Training" here means prompt
engineering + few-shot examples + evals, not weight updates.**

### Layer 3 — The flywheel (the actual moat).
Every parsed goal, every debate transcript, every allocation + realized outcome is **proprietary data
no competitor has**. You already have the `events` and `portfolios` tables — that's the substrate. The loop:
1. Log every agent input / output / transcript / cost (the admin **Brain Monitor** is the UI for this).
2. Compare predicted vs realized outcomes.
3. Use that to (a) iterate prompts via evals, (b) recalibrate Monte Carlo params, (c) eventually
   fine-tune the cheap models.

---

## Separate training platform, or API + tune on-platform?
**Recommended (and what your architecture implies):**
- **Inference:** Claude / OpenAI via API, routed through **Vercel AI Gateway**; orchestrate with the
  **AI SDK** inside Vercel Functions (or a small dedicated orchestrator service when you outgrow function
  limits — your SysBackend already names an *"AI Orchestrator"*).
- **Heavy compute (Monte Carlo):** a small **Python service** (Modal / Railway / Fly, or Python Vercel
  functions) — CPU-heavy, not edge-friendly, keep it separate. *(Current MVP uses a TS implementation
  in a Vercel function, which is fine until volume requires extracting.)*
- **Data / flywheel:** **Neon** (already there); add **pgvector** later for retrieval over past
  decisions + protocol docs.
- **Evals / observability:** **Braintrust / LangSmith** or homegrown on Neon — score every decision.
- **Fine-tuning:** only **later**, only for narrow cheap tasks (NLP parser, explainer) to cut cost /
  latency — using the provider's hosted fine-tuning on your accumulated dataset. **Never fine-tune the
  risk decision.**

> **So: No, you don't need a separate AI training platform early.** API + on-platform orchestration +
> data accumulation + eval-driven prompt iteration. **The moat is data + deterministic engines +
> guardrail architecture, not a custom-trained trading brain.**

---

## "Adjust / change strategies / fine-tune" — the right mental model
**Strategy changes are config + prompt versions, not model weights:**
- Allocation algorithm params, guardrail thresholds, protocol allowlist → **deterministic config the
  live pipeline reads**.
- The admin **What-If Simulator + A/B test + skill toggle** screens are exactly the right control plane
  — wire them to real **versioned config / prompts** and measure variants by **realized Sharpe / outcome**.
- **Changing a strategy = change config → instantly backtest → A/B → roll out / roll back. No retraining.**

*(This is exactly what the **Strategy Control Plane** under Admin → Guardrails already does for the
growth cap; the same pattern extends to every other parameter and to prompt versions.)*

---

## Proving it's real (B2B / customers / investors)
1. **Wire one real path end-to-end** (the highest-value next step): goal → real Claude parse → real
   Monte Carlo → real guardrail → real allocation, shown with **real latency / cost**. The playground
   stops being a mockup. *(✅ done — see `/api/brain` and the B2B Playground.)*
2. **On-chain proof:** a real **Anchor vault on devnet** (then mainnet) — deposit / withdraw / rebalance
   with the guardrail assertion **on-chain and viewable on a block explorer**. **This is your strongest
   "not a mockup" evidence.** *(⏳ pending devnet SOL; see `03_NEXT_PLAN_AND_PROMPT.md`.)*
3. **Audit trail:** every decision logged (inputs / outputs / transcript / cost) — **regulatory-grade**,
   already designed in the Brain Monitor. *(✅ done — `decisions` table + Admin → Brain.)*
4. **Real backtests vs benchmarks** (wire the Backtest tab to the real engine): Sharpe, max DD, vs SOL /
   savings / competitors. *(✅ done — `/api/backtest` + Admin → Backtest.)*
5. **Third-party validation:** OtterSec / Halborn smart-contract audit, your Superteam placement, real
   on-chain txns. *(planned — see `09_GO_LIVE_FEATURES.md`.)*
6. **Regulatory wedge:** real money + structured products = licensing (MiCA). **Your B2B model — where
   the partner holds the license — is the smart way in. Lead with it.**

---

## Competitiveness
**Margarita / Cega ship fixed, manual structured products.** Norvex's edge: **natural-language goal →
AI-personalized principal-protected product at $100 min**, defended by the **guardrail architecture +
the data flywheel + the proprietary protocol-risk DB**. **None of that requires a fine-tuned model — it
requires the real engines + the loop.**

---

## TL;DR for the team
- Don't try to "train Norvex." Train **prompts + config + evals** instead.
- The **moat = deterministic engines + on-chain guardrails + the data flywheel** — not a model.
- The next, highest-impact "make it real" lever is the **on-chain vault (R5.3)**.
- The next, highest-impact "make it smarter" lever is the **eval harness + outcome attribution** on the
  already-accumulating `decisions` table.

See also: `05_AI_BRAIN_ARCHITECTURE.md` (full system), `06_AI_BRAIN_NO_TRAINING.md` (the practical
how-to-change-it), `08_COMPETITORS_USP.md`, `09_GO_LIVE_FEATURES.md`.
