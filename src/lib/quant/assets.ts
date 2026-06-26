import type { AssetParams } from "./montecarlo";

// Default per-asset parameters (annualized). R5.2 replaces these with values
// derived from real Pyth price history + DeFiLlama yields.
export const ASSET_PARAMS: Record<string, AssetParams> = {
  SOL: { mu: 0.25, vol: 0.85, lambda: 1.2, jumpMean: -0.18, jumpStd: 0.22 },
  ETH: { mu: 0.20, vol: 0.72, lambda: 0.9, jumpMean: -0.15, jumpStd: 0.20 },
  BTC: { mu: 0.18, vol: 0.58, lambda: 0.7, jumpMean: -0.12, jumpStd: 0.18 },
};

export const SAFE_APY = 0.062; // safe-leg yield (e.g. Kamino USDC) — R5.2 makes this live.

export function assetParams(asset: string): AssetParams {
  return ASSET_PARAMS[asset] ?? ASSET_PARAMS.SOL;
}

// Stressed params for guardrail stress tests (worse drift + heavier jumps).
export function stressed(base: AssetParams, severity: number): AssetParams {
  return {
    mu: base.mu - severity,
    vol: base.vol * (1 + severity),
    lambda: base.lambda * (1 + severity * 2),
    jumpMean: base.jumpMean - severity * 0.3,
    jumpStd: base.jumpStd * (1 + severity),
  };
}
