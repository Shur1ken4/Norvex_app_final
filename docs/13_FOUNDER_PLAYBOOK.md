# 13 — Founder Playbook

> The operational + strategic doc — how to actually run Norvex week to week, what to say to whom, and
> how to take it from MVP to exit. Merges the May 2026 strategic playbook with the post-R6 operational
> rhythm. Use in tandem with 03 (next steps), 09 (go-live), 10 (demo scripts) and 11 (the
> architecture thesis).

---

## 0 — Where you are right now (snapshot)

- **Product:** MVP live at https://norvexapp.vercel.app, gated. Real AI brain, real DB, real revenue
  tracking, real role separation, R6 visual identity shipped. Only R5.3 (on-chain devnet vault)
  blocked on devnet SOL.
- **Stage:** post-MVP, pre-pilot. Inside NDRC pre-accelerator + Solana Frontier Hackathon (May 11
  submission). 4th place at Superteam Ireland Pitchathon. Design partner Alejandro Gutierrez
  onboarded.
- **Team:** Sergei (CTO) + Aleksander (CEO). Two founders, no employees, no formal advisors yet
  beyond design-partner mentor.
- **Money:** no revenue yet. Operating cost is essentially Vercel + Neon + AI Gateway (negligible
  pre-traffic). Personal runway, no funding raised.
- **Wedge:** AI-built principal-protected investing at $100 minimum. B2B partner-holds-the-license
  is the regulated route to market.

---

## 1 — Business card + 10-second pitches

**Card front**
> **norvex**
> Your private banker. Built by AI.

**Card back**
> Tell it your goal. It protects your money.
> It captures the upside. Starting at $100.
> norvex.io

### Audience-specific 10-second pitches

| Audience | What you say |
|---|---|
| **Anyone (default)** | "You tell our AI your investment goal in plain English. It builds a custom portfolio that protects your downside and captures crypto upside." |
| **At a party** | "A savings account that also buys a lottery ticket with the interest." |
| **Crypto person** | "AI-built principal-protected structured products on Solana. $100 minimum. Monte Carlo validated." |
| **Investor** | "Democratizing the $7T structured products market with AI agents. Wealthfront for DeFi." |
| **Neobank exec** | "Structured yield products as an API. Your users get custom crypto exposure. You keep the customer." |

**The 60-second pitch (memorize):**
> Norvex turns a plain-English goal — *"grow my $10k but don't let me lose it"* — into a personalized,
> principal-protected investment, in one sentence. The AI does the judgment work — bull vs bear
> debate, allocation — and deterministic math + on-chain guardrails enforce the risk limit. It's the
> structured product private bankers sell to millionaires, rebuilt for $100 and delivered through
> wallets and neobanks via API. We're €X away from a paid pilot with a regulated EU partner; the
> structured product is issued under their license, so we ship pre-MiCA.

---

## 2 — Scaling model (the long arc)

### Phase 1 — PROVE *(now → Q4 2026)*
- 1 product: Principal-Protected Note
- 1 chain: Solana
- 100–500 users, **$1M TVL**
- Revenue: ~$7.5K (doesn't matter yet — the milestone is real money flowing, not the size)
- Team: 2 founders + 1 dev + 1 advisor

### Phase 2 — EXPAND *(2027)*
- 4–6 product types (multi-asset baskets, longer durations, yield-only mode, etc.)
- B2B API live with wallets (Phantom, Jupiter)
- 2K–10K users, **$10–50M TVL**
- Revenue: $75K–$500K
- Team: 6–8

### Phase 3 — DOMINATE *(2028+)*
- Multi-chain (Solana + Base + Arbitrum)
- White-label for neobanks
- (Optional) governance token launch
- 50K+ users, **$200M+ TVL**
- Revenue: $1.5M–$7.5M
- Team: 15–25

---

## 3 — The 6-week sprint plan (immediate)

Convert the MVP into something a regulated B2B partner will pilot. Two parallel tracks every week.
**Cap at 6 weeks before re-planning** — anything still open becomes the next sprint's input.

### Weeks 1–2

| Track A — On-chain proof | Track B — Pipeline |
|---|---|
| **Fund devnet wallet** (`6eLz…CLoK`) — web faucet, hotspot CLI airdrop, or buy + bridge | Send the deck + the live link to **20 EU wallets/neobanks/DeFi protocols**. Personal warm intros first (Superteam Ireland, NDRC alumni, Dogpatch network) |
| Write `norvex_vault` Anchor program (see 03's ready prompt) | Aim for **3 partner exploration calls / week** |
| `anchor build && anchor deploy` to devnet | Each call ends with: "what would your compliance team need to see to approve a pilot?" |

**Exit criteria:** real devnet transaction signature linkable on Solana Explorer; 6 partner calls
booked.

### Weeks 3–4

| Track A — Real-money readiness | Track B — Partner conversion |
|---|---|
| **Eval harness** (`/api/admin/decisions` + outcome attribution) — score every logged decision against realized outcome | Sign **1 design-partner LOI** for a paid pilot. Free-or-discounted in exchange for case-study rights |
| Real historical backtest (replace simulated paths) | Draft the partner integration agreement: revenue share (40% partner / 60% Norvex), data ownership, who-holds-the-license, exit clause |
| Spec out the **smart-contract audit** (OtterSec or Halborn) — quotes, timing | If 2+ partners in late-stage convos: start the **OtterSec/Halborn audit** quote process |

**Exit criteria:** 1 signed LOI; audit firm selected and engaged; eval harness live in admin.

### Weeks 5–6

| Track A — Mainnet path | Track B — Investor narrative |
|---|---|
| Mainnet vault deploy *plan* (not deploy itself — needs audit first): paid RPC (Helius), upgrade-authority multisig, timelock | Update the deck with: live URL, 1 LOI signed, X partner calls completed, real on-chain devnet tx, real fee revenue from pilot if any |
| Sign-in-with-Solana implementation (replaces "soft" access codes for production) | Open a **fundraise conversation** with 5–10 angels + 3 pre-seed funds (Superteam network, NDRC connections). Don't say "raising"; say "would value 30 mins of feedback on our partner pipeline" |
| First protocol CPI spike (Kamino safe-leg yield) | Target: **2 lead-investor conversations** by end of window |

**Exit criteria:** mainnet plan locked; audit kicked off; warm fundraise pipeline of 10+ conversations.

---

## 4 — Pre-accelerator 6-week plan (alternative cut — if you're inside NDRC's structured 6-week)

| Week | Focus | Deliverable |
|---|---|---|
| 1 | Customer discovery: 10 B2C interviews | Documented pain points + quotes |
| 2 | Customer discovery: 10 B2B/wallet conversations | Partnership interest signals |
| 3 | MVP iteration based on feedback | Updated devnet product |
| 4 | Design partner testing (5 partners) | NPS score + feature requests |
| 5 | Pricing validation + financial model | Revenue projections (3-year) |
| 6 | Pitch refinement + NDRC application | 2 pitch decks (fintech + crypto) |

**Walk out with:** validated ICP, 5+ design partners, investor-ready deck, clear Accelerator
application, financial model.

---

## 5 — Weekly cadence (lock this in)

A solo or two-founder team without rhythm drifts. Block these on the calendar; protect them.

| Day | Block | What |
|---|---|---|
| **Mon 9–11** | Weekly plan | Aleksander + Sergei sync. Last week's wins / blocks / numbers. This week's 3 priorities each. Update `/admin → Analytics` snapshot. Save to Notion log |
| **Tue–Thu** | Deep work | No meetings before 14:00 if possible. Build / write / ship. Aleksander focuses on partner calls + outbound; Sergei on R5.3 → audit prep → eval harness |
| **Tue/Thu afternoon** | Partner calls | Target 2 calls each per week. Always end with: "what would unblock a pilot from your side?" Log the answer |
| **Fri 14–16** | Metrics review | Pull numbers from `/admin`. TVL, # accounts, # decisions, # demos run, # partner calls, # LOIs. Update the metrics dashboard |
| **Fri 16–17** | Founder retro | What worked, what didn't, what to change Monday. 15 min written, share with each other |
| **Sat or Sun** | Half-day off (mandatory) | Burnout will kill this faster than competition will |

---

## 6 — Metrics that matter (north star + supporting)

**North star:** **paid pilot revenue** (€ MRR from B2B partners). Until that's real, every other
number is leading-indicator noise.

Track weekly in a single tab:

| Metric | Today | 8-week target | 16-week target |
|---|---|---|---|
| **Partner calls completed** | (your number) | 25 | 60 |
| **Pilot LOIs signed** | 0 | 1 | 3 |
| **Paid pilot MRR** (€) | 0 | 0 | 5k–15k |
| **Real-wallet portfolios deployed** (focus group) | ? | 30 | 100 |
| **Demo / sim portfolios deployed** | ? | 100 | 400 |
| **AI decisions logged** | ? | 250 | 1,000 |
| **Eval pass rate** (guardrails + VaR-within-limit + prediction error) | n/a | ≥95% | ≥97% |
| **Audit milestone** | not started | engaged | audit complete |
| **On-chain mainnet txns** | 0 | 0 (still devnet) | first pilot live |
| **Personal runway (months)** | (your number) | the same minus 4 | re-raise threshold |

If any column shows "not moving" two weeks in a row, that's a blocker — escalate to Friday retro.

---

## 7 — Ideal Customer Profile (ICP)

### B2C primary: the Crypto-Curious Professional
- **Age:** 25–40
- **Income:** $50–150K
- **Crypto experience:** owns some, doesn't trade actively
- **Portfolio:** $10K–$100K mixed savings/stocks
- **Deposit size:** $1,000–$10,000
- **Pain:** wants crypto upside, terrified of losing money
- **They say:** *"I want in but I can't afford to lose this."*
- **Find them:** Reddit, Twitter/X, YouTube finance, Revolut/N26 users
- **Why we win:** plain English removes the complexity barrier; principal protection removes the
  fear barrier

### B2C secondary: the Stablecoin Sitter
- **Age:** 20–45
- **Crypto experience:** has USDC/USDT sitting idle
- **Deposit size:** $2,000–$20,000
- **Pain:** knows they should earn more yield
- **They say:** *"My USDC is just sitting there."*
- **Find them:** exchange users, Phantom wallet users
- **Why we win:** keeps principal safe, earns more than savings, plus upside

### B2B primary: the Crypto Wallet
- **Examples:** Phantom, Backpack, Jupiter
- **Their users:** already hold crypto on Solana
- **Their problem:** users park stablecoins, low engagement, no yield product
- **What we offer:** an "Earn" tab powered by Norvex
- **Revenue split:** 30–40% of management fee to the partner
- **Sales cycle:** 2–4 months
- **Decision-maker:** Head of Product / Partnerships
- **Why they say yes:** new revenue stream, higher user retention, real differentiation vs other
  wallets

---

## 8 — B2C then B2B strategy

**Start B2C (now):** ship to crypto-native early adopters via the gated preview. Build community on
Twitter/X and Discord. Every user = training-data signal for the eval harness. Every dollar of TVL
= proof for B2B conversations.

**Layer B2B (Q2 2027):**

| Priority | Partner type | Sales cycle | Why this order |
|---|---|---|---|
| 1 | **Crypto wallets** (Phantom, Backpack) | 2–4 months | Users already on Solana, lowest integration friction |
| 2 | **DeFi protocols** (Kamino, Jupiter) | 1–3 months | Already integrated in our stack |
| 3 | **Crypto exchanges** (Coinbase, Kraken) | 4–8 months | Massive distribution, slower compliance |
| 4 | **Neobanks** (Revolut, N26) | 6–12 months | Biggest TAM, slowest sales, regulated buyer |

**B2B revenue model:** 15–25 bps on partner TVL + **60/40 management-fee split (Norvex/partner)**.

---

## 9 — Sales playbook (B2B is where the early money is)

### Cold-outreach template

> Hi [name],
>
> Norvex is an API that adds AI-built principal-protected crypto exposure to consumer fintech apps.
> Your users see "Earn 5–9% with protected downside"; you collect 40% of management fee + 10% perf;
> the structured product is issued under our partner's license, so your compliance team doesn't have
> to underwrite the risk.
>
> Live demo (real AI, real Monte Carlo, real numbers — not slides):
> https://norvexapp.vercel.app — password `norvex-team-2026` → Settings → Team access → code
> `norvex-b2b-2026` → API / B2B → Playground.
>
> 20-minute call this week? I'll bring a revenue projection for [their user count].
>
> — Aleksander

### The B2B demo script (20 min)
1. **2 min — their world.** How do your users access crypto today? What compliance constraints
   stop you doing more? What's your AUM / user count?
2. **5 min — landing + hero card.** Set the "we look real" anchor. Don't sell yet.
3. **5 min — API/B2B → revenue calculator.** Plug in *their* numbers. This is where the call
   converts.
4. **5 min — Playground.** Type a goal, show the real Claude debate + Monte Carlo + cost +
   latency. *"This is what your users would get; this is what your API call costs."*
5. **2 min — close.** "Want to do a 60-day no-cost pilot? I'll send the LOI today."
6. **1 min — calendar next step.**

### Consumer is the brand layer, not the channel (yet)
- Shows partners what their users would experience
- Generates testimonials for the deck
- Builds the waitlist (referral loop is wired)

**Don't run consumer paid acquisition pre-mainnet.** The waitlist + deck story is enough; spend on a
gated devnet product is wasted.

---

## 10 — Decision framework (say-yes / say-no)

When in doubt, ask: **"does this move the north star (paid pilot MRR)?"**

| Say YES when | Say NO when |
|---|---|
| It's a real partner call with a regulated EU platform | It's a generic "let's chat" with no buyer authority |
| A potential angel investor offers a 30-min call | A fund wants a full deck + 90-min meeting and you have ≤1 LOI |
| The audit firm gives a 2-week-faster slot | A vague "we'll integrate later" partner asks for custom dev |
| A consumer feature reduces friction in the B2B demo | A consumer feature only matters post-mainnet |
| It's a media opportunity with EU fintech press | It's a generic "founder podcast" with no fintech/compliance audience |
| Pivot conversation surfaces a real signal from ≥3 partners | A single mentor suggests a pivot off one anecdote |

---

## 11 — Investor narrative & framing

### Frame by archetype (do not pitch all three the same)

#### Irish / NDRC / European generalist
- **Lead with:** AI-powered wealth management
- **Avoid:** crypto, DeFi, blockchain (these audiences flinch)
- **Say instead:** "modern financial infrastructure"
- **Comparable:** Wealthfront but for a new asset class
- **Ask:** NDRC Accelerator (€100K SAFE), then pre-seed €250–500K

#### Crypto-native VCs (US/UK)
- **Lead with:** on-chain structured products, Solana-native, AI agent
- **Comparable:** Margarita Finance but for retail, with natural language
- **Differentiation:** NLP interface, $100 min, multi-agent reasoning, 5-layer guardrails
- **Ask:** pre-seed $500K–$1M with Solana Foundation grant

#### Neobank / fintech strategic
- **Lead with:** B2B infrastructure / structured products API
- **Comparable:** Plaid for yield products
- **Value prop:** your users get bespoke investments; you get a new revenue stream; zero build cost
- **Ask:** partnership discussion first, then strategic investment

### Valuation benchmarks

| Stage | Metric | Range (post-money) |
|---|---|---|
| Pre-seed | Team + vision | **€2–4M post** |
| Seed | $1–5M TVL + working product | **€5–10M post** |
| Series A | $50M+ TVL + revenue + B2B | **€20–40M post** |

### Do say / don't say
**Do say:**
- "Live AI brain in production — Claude judgment clamped by deterministic Monte Carlo. Every
  decision logged, every guardrail enforced. Audit trail is regulatory-grade."
- "The moat is the data flywheel + the on-chain guardrail + the proprietary protocol risk DB —
  not a custom-trained model."
- "B2B-partner-holds-the-license is the regulated wedge. We've had X partner conversations with EU
  platforms. Our first LOI is [name] who serves [N] users."
- "0.75% mgmt + 10% perf. Partner takes 40%, we take 60%."
- "We don't train the model. Strategy changes are versioned config changes the live pipeline reads
  instantly. This is the future of regulated AI."

**Don't say:**
- "We'll replace private banks." (Too big, too vague.)
- "We're a DeFi protocol." (You aren't. You're a regulated structured-product brain that uses DeFi
  rails. The distinction matters to a compliance-aware investor.)
- "We'll do B2C eventually." (Implies dilution of focus.)
- "We use AI to predict markets." (You don't. AI interprets goals; math handles risk.)
- Numbers you can't defend (TAM fine if cited; SOM conservative; ARR projection at pre-seed = 12-mo
  not 5-year).

---

## 12 — Pitch deck fixes (do today)

1. **Fix name inconsistency:** slide 4 says "Adam" in the header but "Andrew" in the outcomes.
2. **Add a "Why Now" slide:** Solana maturity, AI agents production-ready, MiCA clarity coming,
   Friktion shutdown left a gap.
3. **Add a competitive slide:** address Margarita Finance head-on, show differentiation.
4. **Add an "Ask" slide:** how much you're raising, for what, what milestones it buys.
5. **Reframe yield claims:** "variable DeFi lending yield" not "5–7%" (rates fluctuate; locked-in
   numbers create a false-promise risk).
6. **Add revenue at scale:** show revenue at $200M and $1B TVL, not just $50M.
7. **Strengthen team slide:** add advisory board, emphasize Microsoft Copilot experience.

---

## 13 — Fundraising sequence

| When | Source | Size | Notes |
|---|---|---|---|
| **Now** | Solana Foundation grant | $25–50K non-dilutive | Apply first; quick close |
| **Q3 2026** | NDRC Accelerator | €100K SAFE | Already inside the program; secure the SAFE |
| **Q3 2026** | Alliance DAO | $100–250K | Crypto-native accelerator, parallel application |
| **Q4 2026** | Pre-seed | $250–500K | Solana ecosystem angels + Superteam network |
| **Q1–Q2 2027** | Seed | $1–2M | Target funds: **Multicoin, Framework, Fabric, Robot Ventures** |

**Triggers (don't raise before these):**
- **Pre-seed:** audit engaged + ≥1 LOI signed + ≤6 months personal runway. Use for audit, mainnet
  RPC, legal, 1 part-time growth hire.
- **Seed:** first 2 partner pilots paying + TVL ≥€500k. Use for team (3–4 hires), mainnet launch,
  regulatory work, marketing.
- **Don't raise before audit is engaged.** Investors will discount on uncapped on-chain risk.

---

## 14 — Money model & revenue projections

### Unit economics today
- **Management fee:** 0.75%/yr of TVL
- **Performance fee:** 10% of realized gains
- **B2B partner share:** 40% partner / 60% Norvex
- **Cost stack (post-traffic):**
  - Vercel: free until ~50k requests/day, then ~€20/mo
  - Neon: free until ~1GB storage, then ~€19/mo
  - AI Gateway → Claude: ~€0.01–0.03 per portfolio built (cached) — at 1,000/mo = €10–30/mo
  - Helius/Triton paid RPC (mainnet): ~€50–200/mo
  - **Audit (one-time):** **€30k–80k** (OtterSec / Halborn). Single biggest cash drag pre-revenue.

### Revenue at scale

| Stream | Rate | At $50M TVL | At $200M TVL |
|---|---|---|---|
| Management fee | 0.75% annual | $375K | $1.5M |
| Performance fee | 10% of gains | $100–250K | $500K–1M |
| B2B infrastructure | 15–25 bps | Variable | $300–750K |
| Execution spread | 5–15 bps | $25–75K | $100–300K |
| **Total** | | **~$500K–700K** | **~$2.4–3.6M** |

### Pricing decisions to make in the next 8 weeks
- **Pilot pricing:** free for 60 days, then revenue share. Lowers partner-side friction without
  cutting your structural take rate.
- **Minimum partner commitment:** 90 days post-pilot, with case-study consent.
- **Sandbox vs production:** sandbox always free; production gated on KYC + signed agreement.

---

## 15 — Legal / compliance roadmap

You can't dodge this; the question is sequencing.

| Stage | What you do | When | Cost |
|---|---|---|---|
| **Pre-pilot** | Founder agreement (vesting, IP, decision rights). Standard EU NDA template | This month | €0–1k |
| **Pilot** | Pilot agreement template: data, revenue share, exit, IP, liability cap. Irish startup lawyer (LK Shields / Mason Hayes / NDRC's recommended) | Before LOI #1 | €1.5–3k |
| **Mainnet readiness** | Partner integration agreement (partner issues the product under their license). MiCA assessment from outside counsel | Before mainnet deploy | €5–10k |
| **Custody & key management** | Multi-sig upgrade authority on Anchor program (2-of-3) + 48h timelock. Hardware-wallet keys offline | Before mainnet deploy | hardware cost |
| **KYC/AML** | Inherit from B2B partner first; direct integration (Sumsub/Veriff) only when D2C users land | Year 2 | TBD |
| **Insurance** | E&O + cyber + smart-contract (Nexus Mutual or Sherlock) | Post-audit, pre-mainnet | ~€10k/yr |
| **Regulatory clarity** | Outside-counsel opinion on jurisdiction + the principal-protection claim | Before any paid mainnet user | €5–10k |

**The single most important legal move right now:** clarify in writing that **the B2B partner
issues the structured product under their license**, not you. This is the wedge that lets you ship
pre-MiCA.

---

## 16 — Team action plan & hiring

### Sergei (CTO) — own the product
- Ship devnet MVP (R5.3) end of June
- Build AI agent demo for investor meetings
- Write 2 technical blog posts (architecture + risk engine)
- Interview and hire Solana developer (team member 3)
- Network with Kamino / Jupiter teams for integration

### Aleksander (CEO) — own the business
- 20+ customer interviews in 4 weeks
- Build Twitter/X presence (3 posts per week minimum)
- Apply to NDRC Accelerator + Solana Foundation grant
- Attend 2 Solana/DeFi events before Q3
- Start conversations with Phantom and Jupiter for B2B
- Prepare 2 pitch decks (fintech framing + crypto framing)

### Hiring plan (default = don't hire until forced)

| Hire | Trigger | Comp |
|---|---|---|
| **Senior Solana / Rust developer** | First — once R5.3 done & audit kicked off. Find via Superteam, Solana job boards, Anchor Discord. Builds: vault program, CPI integrations, rebalance bot | Equity-heavy (1–3%) + modest salary or grant-funded |
| **First advisor: quant / structured products** | Now — adds credibility for investors. Find via UCD Smurfit alumni, London structured-products desks. Validates risk model, reviews MC params | 0.25–0.5% equity, part-time |
| **Part-time growth / BD operator** | 3+ partner pilots in active negotiation | Hourly (€60–90/hr) from pre-seed |
| **AI / quant engineer** | Eval harness shows a model needs domain tuning you can't do yourself | Equity-heavy, seed |
| **Designer (contract)** | Brand refresh or marketing site for public launch | One-off project (€8–15k) or part-time |
| **Compliance / legal lead (fractional)** | Mainnet pilot signed | Fractional GC via firm — €2–5k/mo |

**Don't hire engineers until the audit is done.** The unaudited codebase is risky to expand.

---

## 17 — Competitive analysis

| Company | Stage | Approach | Norvex advantage |
|---|---|---|---|
| **Margarita Finance** | $1M pre-seed | Dropdown-based yield boosters on Solana | Natural-language input, $100 min, multi-agent AI |
| **Cega Finance** | Series A | Fixed vault strategies with barrier options | Personalization, no lockups, AI construction |
| **Friktion** | Shut down | Structured-product vaults on Solana | We learned from their failure — market timing matters |
| **Trading bots** (3Commas) | Various | Execute buy/sell signals | We construct products, not trade. Different category |
| **Robo-advisors** (Wealthfront) | Public | ETF-based traditional | Can't access DeFi yields or crypto exposure |

---

## 18 — Risk register (what could kill the company)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Smart-contract exploit on mainnet** | Med | Catastrophic | OtterSec/Halborn audit; multisig + timelock; insurance; cap mainnet TVL early |
| **Regulatory action (MiCA, country-level)** | Med | High | B2B-partner-holds-license; outside-counsel opinion; conservative claim language |
| **Founders' personal runway exhausts before revenue** | Med-High | High | Audit costs ≤ €50k cap; raise pre-seed at LOI moment; one founder takes part-time consulting if needed |
| **A bigger fintech ships the same wedge** (Revolut, Robinhood, Coinbase) | Med | High | Speed + EU + B2B distribution; partner exclusivity clauses in pilots |
| **Claude API price hike or model deprecation** | Low-Med | Med | AI Gateway abstracts provider; switchable to OpenAI/Llama; cost-monitored in admin |
| **Solana network issue (downtime, congestion)** | Low-Med | Med | Multi-RPC, can pause new deposits; allocation logic is off-chain (still works); communicate transparently |
| **Co-founder split / disagreement** | Low | Catastrophic | Founder agreement with vesting + tie-breaker; quarterly written check-in; mediator pre-agreed (mentor) |
| **AI hallucination produces wrong allocation** | Low (math clamps it) | Med | Existing: LLM cannot exceed deterministic risk ceiling. Continue eval harness; flag drift in admin |

---

## 19 — Exit strategies

1. **Acquisition by crypto exchange / wallet** (Coinbase, Phantom) — 10–20× revenue multiple.
2. **Acquisition by DeFi protocol** (Jupiter, Kamino, Aave) — team + tech buy.
3. **Token launch + protocol decentralization** — 2028+, only after PMF and audit; carries
   regulatory blast radius.
4. **Traditional fintech acquisition** (Goldman / JPMorgan digital-assets arm) — most credible at
   $200M+ TVL.
5. **Independent operation at $1B+ TVL / $7.5M+ revenue** — bootstrap-to-profit, no exit needed.

**Don't optimize for exit. Optimize for the wedge.** Exits are a function of the company you build,
not a goal you aim at.

---

## 20 — Quarterly OKR template

Use this; don't reinvent.

### Q3 2026 — "first real money"
- **Objective:** sign first paying B2B pilot and complete smart-contract audit
- KR1: 2 signed paid pilots (any pricing, any TVL)
- KR2: OtterSec or Halborn audit clean-pass
- KR3: First mainnet deployment with capped TVL (€100k) and 1 partner live
- KR4: €10k cumulative pilot revenue

### Q4 2026 — "now we're a company"
- **Objective:** scale partner pipeline + raise seed
- KR1: 5 paying pilots
- KR2: €500k aggregate TVL
- KR3: €5k MRR
- KR4: Seed round closed (€1.5M–€3M)

### Q1 2027 — team & second product
- 3 hires; B2C-via-partner soft launch in 1 country; second asset class added

### Q2 2027 — geographic expansion
- 2 EU markets, 1 US-via-partner exploration

---

## 21 — Cut list (what NOT to do)

A two-person team gets killed by trying to do everything. Explicit cut list:

- ❌ Custom domain + lift the password gate **before** R5.3 + audit. The gate buys you time.
- ❌ Custom illustrations / brand video / motion design. The current visual identity is enough.
- ❌ Mobile apps. The web app is responsive. Native comes post-revenue.
- ❌ Multi-language. English-only until MRR.
- ❌ Token / airdrop. **Especially this.** Adds regulatory blast radius for zero strategic benefit.
- ❌ NFT integration / "AI agent NFT" features. Out of scope.
- ❌ Conference circuit beyond 1–2 carefully chosen events per quarter.
- ❌ Press until you have a paying partner to name.
- ❌ Open-sourcing core code (the brain orchestrator + guardrail + decision-log is your moat).

---

## 22 — Tools / stack (operating layer)

Separate from the product stack:

| Need | Tool | Why |
|---|---|---|
| Doc & shared knowledge | Notion or this repo's `/docs` | Single source of truth |
| Tasks & sprints | Linear (free ≤2 users) | Lower-friction than Jira; GitHub-native |
| Sales pipeline | Folk or Attio (free tier) | Track partner calls; not spreadsheets |
| Calendar / scheduling | Cal.com | Embed in cold outreach |
| Investor CRM | Notion | Sufficient for ≤50 conversations |
| Async comms | Slack + Loom | Partner walkthroughs |
| Financial tracking | Quaderno or Google Sheet | Pre-revenue, sheet is fine |
| Cap-table | Pulley or Carta starter | Free at this size |
| Banking | Revolut Business or N26 Business | Same-day account |
| AI ops dashboard | `/admin → Brain` (already built) | Watch decisions / cost / latency daily |

---

## 23 — Common founder pitfalls (this stage)

1. **Treating the audit as the milestone, not the partner LOI.** The LOI proves demand; the audit
   protects you when demand becomes capital. Don't pay €40k for audit before someone has signed
   intent to use the audited product.
2. **Over-engineering before validation.** The brain is great. R5.3 is necessary. Don't build more
   agents, more assets, more screens — get on more calls instead.
3. **Founder asymmetry.** Sergei builds, Aleksander sells. Both must touch both: Sergei should be on
   ≥1 partner call/week (technical credibility); Aleksander should ship at least design/copy/metric
   updates each week (product feel).
4. **Demo theater.** The product is genuinely real — the deck and the call should not feel like a
   demo. Open the live URL on every call. Run a real goal. Show a real decision in admin. Don't
   read slides.
5. **Mentor capture.** You're inside NDRC. Good mentors give conflicting advice. Run the filter:
   *"does this move the north star?"* — if no, thank them and ignore.
6. **Conflating MVP with launch.** Launch isn't a date; launch is the moment the audit clears + a
   paying partner is live + a real user has earned a real return. Don't announce launch on Twitter
   the day the gate lifts.

---

## 24 — When to revisit this doc

- **Every 6 weeks** at sprint boundary — update metrics, OKRs, risk register.
- **After every signed LOI** — update the narrative; add the partner to the pitch.
- **After the audit** — rewrite legal/compliance + risk sections; the story changes.
- **After the seed round** — rewrite hiring + cut list; the constraints change.

See `00_INDEX.md` for the rest of the handover pack. See `03_NEXT_PLAN_AND_PROMPT.md` for the
specific R5.3 unblock. See `09_GO_LIVE_FEATURES.md` for the full go-live track list.
