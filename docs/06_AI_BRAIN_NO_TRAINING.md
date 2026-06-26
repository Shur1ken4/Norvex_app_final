# 06 — How the AI Brain Works (and why we don't "train" it)

## The mental model
Norvex's brain is **not** a single neural net we train to "pick investments." It's an **orchestration**
of (a) a few LLM calls for *judgment* and (b) deterministic math for *safety*. This is deliberate: in a
principal-protection product, the guarantee must be **provable**, and a fine-tuned model's output is not
provable. So the safety-critical decisions are math/code, and the LLM only proposes within bounds it
cannot exceed.

## What actually happens on each request
1. **Parse** (LLM, Claude Haiku): turns "Grow my $20k in ETH, max 8% loss" into structured params.
2. **Market snapshot** (deterministic): live volatility + yields.
3. **Monte-Carlo** (deterministic): 5–10k simulated paths → the **maximum growth allocation** whose VaR
   stays within the user's max-loss. This number is the *ceiling*.
4. **Bull/Bear/PM debate** (LLM, Claude Sonnet): argues for/against more growth and picks a % — but the
   code **clamps** it to the Monte-Carlo ceiling. The LLM can be conservative, never reckless.
5. **Guardrails** (deterministic): 6 checks; all must pass or it's rejected.
6. **Rationale** (LLM): plain-English explanation for the user.
7. **Log** the whole decision to Neon (the flywheel).

## Why we don't need to train/fine-tune a model
- The **risk decision is math**, not a model — you don't train Monte-Carlo or VaR; you compute them. They're
  auditable and reproducible (seeded).
- The **LLM is bounded** — even a "wrong" LLM answer can't breach the limits because the guardrails + the
  Monte-Carlo ceiling override it.
- So "making the AI smarter" = better **prompts + market inputs + guardrail tuning**, not weight training.

## The three ways to change behavior (in order of how often you'd use them)
1. **Strategy config (no code, no retrain, instant):** Admin → Guardrails → adjust the growth cap → Save
   version → Activate. The live pipeline reads the active `config` row immediately.
2. **Prompts (code edit, redeploy, no retrain):** edit the agent prompts in `src/lib/ai/agents.ts`
   (parse / Bull-Bear-PM / rationale). This is where most "smarter reasoning" work happens.
3. **Model fine-tuning (rarely, much later):** only worth it for the *cheap* parser/explainer once you've
   collected enough logged `decisions`; **never** for the risk decision. Export the `decisions` table and
   use a provider's hosted fine-tune. **Not needed for the MVP or even early production.**

## The moat (why this is defensible)
- **Deterministic, provable engines** + **on-chain guardrails** (once R5.3 ships) — competitors can't
  hand-wave the safety claim.
- **Proprietary data flywheel** — every parsed goal, debate transcript, and outcome is in `decisions`;
  no competitor has this dataset.
- **Proprietary protocol-risk database** — real scoring of Solana DeFi protocols.
- The LLM is a commodity input; the **architecture + data** are the IP.

## "Do we need to connect AI models?" — No.
It's already connected and running live via Vercel AI Gateway → Claude (uses the project's OIDC, no key).
You only touch it to switch models (one string) or tune prompts.
