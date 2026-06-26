# 09 — Go-Live: What's Needed for Real Clients & Real Money

The MVP proves the product end-to-end on **devnet / simulated funds**. To serve real users with real
money, the following are required. Grouped by track; ordered roughly by dependency.

## Track 1 — On-chain (finish + harden)
1. **Finish R5.3** — deploy the Anchor vault to **devnet** (blocked only on devnet SOL). See 03_NEXT_PLAN.
2. **Real protocol CPI** — integrate Kamino (safe-leg yield) + Jupiter (growth-leg) via cross-program
   invocation, replacing simulated yield. (Their devnet deployments are flaky → do on mainnet-fork/mainnet.)
3. **Mainnet deploy** — migrate the vault + RPC to mainnet-beta with a paid RPC (Helius/Triton).
4. **Smart-contract audits** — OtterSec / Halborn before any real funds; 2-of-3 multisig upgrade
   authority + 48h timelock.

## Track 2 — Identity, security, compliance
5. **Sign-in-with-Solana (SIWS)** — cryptographic wallet auth so roles/ownership are verified, replacing
   the current "soft" access codes.
6. **KYC/AML** — integrate a provider (or rely on the B2B partner's existing KYC).
7. **Licensing / regulatory** — MiCA-readiness; the **B2B-partner-holds-the-license** model is the fastest
   path to market. Legal review of the principal-protection claim + disclosures.
8. **Custody & key management** — secure handling of program upgrade keys; incident runbook.

## Track 3 — Real AI/quant maturity
9. **Eval harness + outcome attribution** — score logged `decisions` (guardrail pass, VaR-within-limit,
   prediction error) and tie realized returns back to decisions; surface accuracy trends in admin.
10. **Real historical backtesting** — replace simulated paths with real historical price replays.
11. **(Optional, later) fine-tune** the cheap parser/explainer on accumulated `decisions` data for
   cost/latency — never the risk decision.

## Track 4 — Product depth (from the V6 backlog, post-launch)
Multiple-asset baskets, notifications/alerts, performance-vs-benchmark history, share cards, decision
audit trail per portfolio (started), B2B webhook delivery (currently mock), admin user-management actions,
mobile-responsive polish, real AI confidence calibration.

## Track 5 — Operations
12. **Observability** — structured logging + error tracking on all route handlers (currently minimal),
    uptime/alerting, AI cost monitoring (AI Gateway).
13. **Rate limiting & abuse protection** on public endpoints once the password gate is lifted.
14. **Lift the password gate** + attach a **custom domain** for public launch.
15. **Background jobs** — move the daily cron to real rebalancing/compounding logic against on-chain state.

## Suggested phasing
- **Phase A (now → weeks):** finish R5.3 devnet vault + SIWS + eval harness → "real on-chain demo".
- **Phase B (mainnet pilot):** audits + mainnet vault + 1 protocol CPI + 1 B2B partner pilot (their license).
- **Phase C (scale):** KYC, more protocols/assets, observability, lift gate + custom domain, marketing.
