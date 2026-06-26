# 10 — Onboarding, Testing Plan & Demo Scripts

**Live link:** https://norvexapp.vercel.app · **site password:** `norvex-team-2026`
(Admin code `norvex-admin-2026`, B2B code `norvex-b2b-2026` — give only to the right testers.)

> No crypto required. Anyone can "Create a demo account" to use the full app.

---

## A) Consumer / user testing (focus group)

**Onboarding steps**
1. Open the link → enter the site password.
2. Click **Try Demo** (or Connect → "Create a demo account"). No wallet/crypto needed.
3. Go through: **Goal → Build → Preview → Deploy → Dashboard**.
4. Try the **Simulator** (sliders + "Show comparison"). Submit **Feedback** and an **NPS** score.

**What we're testing:** Is the goal input intuitive? Is the AI result believable/clear? Does the
principal-protection idea land? Would they deposit real money?

**Message to send testers:**
> Hey — testing Norvex, an AI that builds you a protected crypto investment from a plain-English goal.
> 2-min test, no crypto or signup needed: open https://norvexapp.vercel.app, password `norvex-team-2026`,
> tap **Try Demo**, type something like *"Grow my $10,000, max 5% loss"*, and walk through to the
> dashboard. Then hit **Feedback** and tell me: did it make sense, and would you trust it with real money?

**Test script (5 min):** type 2–3 different goals (a safe one, an aggressive one, a "$100 test"); switch
the growth asset (SOL/ETH/BTC) in the Simulator; deploy one; open the dashboard "decision history".

---

## B) B2B partner demo (wallets / neobanks / DeFi)

**Onboarding steps**
1. Open the link → site password → Settings → Team access → enter **B2B code**.
2. Open **API / B2B**. Walk the tabs: Overview (**revenue calculator** with their real user count + avg
   deposit), **Playground** (run a real goal → real allocation + real latency/cost), **White-Label**
   (pick their brand theme), API Docs, Compliance (+ Generate Sandbox Key).

**What sells it:** the **revenue calculator** (their economics) + the **live playground** (proves the API
is real, not slides) + **white-label** (it looks like *their* product).

**Message to send a partner:**
> Norvex lets you add an AI "Earn" product to [their app] via one API — your users get personalized,
> principal-protected investing, you keep the customer and earn a revenue share. 5-min look:
> https://norvexapp.vercel.app (password `norvex-team-2026`) → Settings → Team access → code
> `norvex-b2b-2026` → open **API / B2B**: plug your user count into the revenue calculator, then hit the
> **Playground** to watch the real AI build a portfolio live (with real latency + cost).

---

## C) Investor demo (proves it's real)

**Flow (10 min):**
1. **Landing** — pause on the hero. The "Built by AI." gradient word + dark Solana-style hero card
   sets the tone: this is a premium product, not a hackathon submission. Walk past the 4 feature
   blocks and the dark comparison section so they see Norvex is positioned vs Private Banking, not
   vs other DeFi apps.
2. **User flow** — type a goal, show the **real** Claude debate + Monte-Carlo numbers in Preview, deploy.
3. **Admin → Brain** — show the **real logged decision** + Bull/Bear/PM transcript, cost, latency,
   guardrails passed (regulatory-grade audit trail).
4. **Admin → Backtest** — run the real Monte-Carlo: Norvex max-DD vs holding SOL directly (the risk story).
5. **Admin → Analytics/Revenue** — real TVL, fee revenue, usage telemetry across the focus group.
6. **Admin → Guardrails (Control Plane)** — change the growth cap, activate a new strategy version, show
   the live pipeline picks it up — "we tune strategy without retraining."
7. *(After R5.3)* show a real **devnet transaction on a Solana explorer** — the "not a mockup" proof.

**One-liner:** *"This isn't a prototype — it's a live AI that makes provably-bounded investment decisions,
logs every one, and lets us tune strategy in real time. The brand and UI are production-ready too."*

---

## D) Feedback collection
- In-app **Feedback** widget and the **NPS** modal write to Neon (`feedback` table).
- As admin: **Admin → Users** (who tested, demo vs real, # portfolios) and **Analytics → Usage**
  (sessions / sims / deploys) show focus-group engagement.
- Export consumer interest from the `waitlist` table (with referral codes/counts).

## E) Logistics / housekeeping
- The codes above are shared secrets — rotate them anytime via `vercel env` (`SITE_PASSWORD`,
  `ADMIN_CODE`, `B2B_CODE`) and redeploy.
- Everyone needs the **site password** first; only give admin/B2B codes to the relevant audience.
- Dark mode + ⌘K command palette are available everywhere for power users/demos.
