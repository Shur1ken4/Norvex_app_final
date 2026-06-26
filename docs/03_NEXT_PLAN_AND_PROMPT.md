# 03 — Next Plan, What's Missing, and a Claude Code Prompt

## What's missing right now
1. **On-chain devnet vault (R5.3)** — the only unfinished phase. Toolchain installed (Solana 3.1.15,
   Anchor 1.0.2); Anchor workspace scaffolded at `/Users/antonmatsepa/norvex/norvex_vault`. **Blocked on
   devnet SOL** (faucet rate-limited; deploy needs ~2–3 SOL into `6eLz…CLoK`). The vault program itself
   is not yet written/deployed, and the app is not yet wired to send on-chain transactions.
2. Nice polish still open (low priority): a couple of DeFiLlama protocol slugs fall back (Marinade/Drift),
   and the backtest return numbers could be tuned.
3. *(Done — for reference)* **Round 6 design refresh** is complete and live. The visual identity
   (Solana × Revolut blend, brand gradient, pill buttons, dark hero banners on every page) shipped
   in May 2026. See **12_DESIGN_SYSTEM.md** for the full system and `02_IMPLEMENTED.md` for the
   change log.

## How to unblock + finish R5.3 (the on-chain proof)
**Step 1 — fund the devnet wallet** (only a human can do this; the security layer blocks remote installers):
- Easiest: a web faucet that doesn't gate (try https://faucet.solana.com on a non-new GitHub, or
  https://www.alchemy.com/faucets/solana-devnet, or QuickNode), or a phone-hotspot CLI airdrop
  (`solana airdrop 2 --url https://api.devnet.solana.com`). Realistically you may need to **buy a small
  amount and bridge/convert, or use a paid RPC faucet** — accumulate ~2–3 SOL to `6eLz…CLoK`.
- Verify: `solana balance` ≥ ~2 SOL.

**Step 2 — hand back to Claude Code with this prompt:**

> Continue R5.3. The devnet wallet `6eLz…CLoK` now has ≥2 SOL and Anchor 1.0.2 + Solana 3.1.15 are
> installed (workspace scaffolded at /Users/antonmatsepa/norvex/norvex_vault). Write the `norvex_vault`
> Anchor program: a `create_vault(id, amount, max_dd_bps, growth_amount)` instruction that (a) asserts
> `growth_amount <= max_loss_budget` (the Iron Rule), (b) asserts `growth_amount <= 25% of amount`
> (hard cap), (c) creates two **isolated** PDA vaults (safe + growth, distinct seeds) and transfers SOL
> into them, and (d) stores a Portfolio PDA; plus a `withdraw(id)` that closes the vaults back to the
> owner. `anchor build`, then `anchor deploy` to devnet via the Helius RPC. Add `src/lib/chain/vault.ts`
> (Anchor/web3.js client) and set `NEXT_PUBLIC_VAULT_PROGRAM_ID` + `HELIUS_RPC_URL` in Vercel. Wire the
> Deployed screen so a **real wallet** sends a real `create_vault` devnet transaction and shows the
> signature + Solana-explorer link; demo/simulated wallets keep the off-chain flow. Then `vercel --prod`
> and verify the transaction on explorer. Heed AGENTS.md — read the installed Anchor docs before coding.

## After R5.3 — recommended sequence (still pre-mainnet)
1. **Real protocol routing (devnet stubs):** label which protocol each leg maps to; keep simulated yield.
2. **AI eval harness:** score logged `decisions` (guardrail pass, VaR-within-limit, prediction error)
   and surface accuracy trends in admin — turns the flywheel into a measurable learning loop.
3. **Decision → outcome attribution:** link each portfolio's realized return back to its `decisions` row.
4. **Polish backtest realism** + fix DeFiLlama slugs (Marinade/Drift).

## See also
- **09_GO_LIVE_FEATURES.md** for the bigger "serve real clients with real money" roadmap (mainnet, CPI,
  audits, KYC, licensing, SIWS auth).
