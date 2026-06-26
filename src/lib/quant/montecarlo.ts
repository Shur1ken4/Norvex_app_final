// Deterministic Monte Carlo for principal-protected allocation.
// GBM + Merton jump diffusion on the growth leg; safe leg accrues yield.
// Seeded RNG so results are reproducible (important for auditable backtests).

export interface AssetParams {
  mu: number;        // annual drift (growth asset)
  vol: number;       // annual volatility (growth asset)
  lambda: number;    // jump intensity (events/yr)
  jumpMean: number;  // mean log jump size (negative = crash bias)
  jumpStd: number;   // jump size stddev
}

export interface McInput {
  safePct: number;     // 0..100
  growthPct: number;   // 0..100
  asset: AssetParams;
  safeApy: number;     // annual yield on safe leg (e.g. 0.06)
  horizonDays: number; // e.g. 365
  paths?: number;      // default 5000
  seed?: number;
}

export interface McResult {
  var95: number;   // 95% Value-at-Risk as a positive loss fraction (e.g. 0.042)
  cvar95: number;  // expected shortfall beyond VaR (positive loss fraction)
  sharpe: number;
  maxDD: number;   // worst single-path drawdown as positive fraction
  mean: number;    // mean total return fraction
}

// mulberry32 — small deterministic PRNG.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box–Muller standard normal from a uniform generator.
function normal(u: () => number): number {
  let x = 0, y = 0;
  while (x === 0) x = u();
  while (y === 0) y = u();
  return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
}

export function monteCarlo(input: McInput): McResult {
  const paths = input.paths ?? 5000;
  const days = Math.max(1, Math.round(input.horizonDays));
  const dt = 1 / 365;
  const { mu, vol, lambda, jumpMean, jumpStd } = input.asset;
  const safe = input.safePct / 100;
  const growth = input.growthPct / 100;
  const u = rng(input.seed ?? 12345);

  const returns: number[] = new Array(paths);
  let worstDD = 0;
  let sum = 0;

  for (let p = 0; p < paths; p++) {
    let logPrice = 0; // log return accumulator for the growth asset
    let minLog = 0;
    for (let d = 0; d < days; d++) {
      const drift = (mu - 0.5 * vol * vol) * dt;
      const shock = vol * Math.sqrt(dt) * normal(u);
      let jump = 0;
      if (u() < lambda * dt) jump = jumpMean + jumpStd * normal(u);
      logPrice += drift + shock + jump;
      if (logPrice < minLog) minLog = logPrice;
    }
    const assetReturn = Math.exp(logPrice) - 1;            // growth leg P/L
    const safeReturn = input.safeApy * (days / 365);        // safe leg yield
    // Growth leg can't lose more than its capital (isolated, no leverage).
    const growthPL = growth * Math.max(-1, assetReturn);
    const total = safe * safeReturn + growthPL;
    returns[p] = total;
    sum += total;
    // Portfolio drawdown driven by the growth leg's worst point.
    const dd = -(growth * (Math.exp(minLog) - 1));
    if (dd > worstDD) worstDD = dd;
  }

  returns.sort((a, b) => a - b);
  const mean = sum / paths;
  const idx = Math.floor(0.05 * paths);
  const var95 = Math.max(0, -returns[idx]);
  let tail = 0;
  for (let i = 0; i <= idx; i++) tail += returns[i];
  const cvar95 = Math.max(0, -(tail / (idx + 1)));
  // Annualized Sharpe vs the safe yield as risk-free.
  const variance = returns.reduce((s, r) => s + (r - mean) * (r - mean), 0) / paths;
  const std = Math.sqrt(variance) || 1e-9;
  const rf = input.safeApy * (days / 365);
  const sharpe = ((mean - rf) / std) * Math.sqrt(365 / days);

  return { var95, cvar95, sharpe, maxDD: worstDD, mean };
}

// Sweep growth ratios; pick the highest-Sharpe split whose VaR95 stays within maxDd.
export function optimalSplit(
  asset: AssetParams,
  safeApy: number,
  maxDd: number,
  horizonDays: number,
  growthCap = 25
): { safePct: number; growthPct: number; mc: McResult } {
  let best = { safePct: 100, growthPct: 0, mc: monteCarlo({ safePct: 100, growthPct: 0, asset, safeApy, horizonDays }) };
  let bestSharpe = -Infinity;
  for (let g = 1; g <= growthCap; g++) {
    const mc = monteCarlo({ safePct: 100 - g, growthPct: g, asset, safeApy, horizonDays });
    if (mc.var95 <= maxDd && mc.sharpe > bestSharpe) {
      bestSharpe = mc.sharpe;
      best = { safePct: 100 - g, growthPct: g, mc };
    }
  }
  return best;
}
