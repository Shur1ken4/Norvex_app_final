// Deterministic safe/growth allocation with yield-buffer + hard cap.

export const GROWTH_CAP = 0.25; // no AI can exceed 25% growth

export interface AllocInput {
  amount: number;
  maxDd: number;      // user max drawdown fraction (e.g. 0.05)
  safeApy: number;    // e.g. 0.06
  horizonDays: number;
  growthCap?: number; // active strategy cap (defaults to GROWTH_CAP)
}

export interface Allocation {
  safe: number;       // $ in safe leg
  growth: number;     // $ in growth leg
  safePct: number;    // %
  growthPct: number;  // %
}

// growth = amount * max_dd, expanded by the yield buffer (safe leg yield can
// absorb extra growth loss), then clamped to the 25% hard cap.
export function computeAllocation(input: AllocInput): Allocation {
  const { amount, maxDd, safeApy, horizonDays } = input;
  const cap = input.growthCap ?? GROWTH_CAP;
  let growth = amount * maxDd;
  let safe = amount - growth;
  for (let i = 0; i < 10; i++) {
    const buffer = safe * safeApy * (horizonDays / 365);
    growth = amount * maxDd + buffer;
    safe = amount - growth;
  }
  if (growth / amount > cap) growth = amount * cap;
  growth = Math.max(0, Math.min(growth, amount));
  safe = amount - growth;
  return {
    safe,
    growth,
    safePct: amount ? (safe / amount) * 100 : 100,
    growthPct: amount ? (growth / amount) * 100 : 0,
  };
}

export interface Scenario { label: string; pct: number; dollars: number }

// Bull/flat/bear scenario cards from the allocation + asset move assumptions.
export function scenarios(amount: number, growthPct: number, safeApy: number, horizonDays: number): Scenario[] {
  const g = growthPct / 100;
  const safeYield = safeApy * (horizonDays / 365);
  const safeContribution = (1 - g) * safeYield;
  const mk = (label: string, assetMove: number) => {
    const pct = (safeContribution + g * Math.max(-1, assetMove)) * 100;
    return { label, pct, dollars: Math.round((amount * pct) / 100) };
  };
  return [mk("Bull +50%", 0.5), mk("Flat", 0), mk("Bear -40%", -0.4)];
}
