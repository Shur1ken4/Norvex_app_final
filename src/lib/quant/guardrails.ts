// The 6 deterministic guardrail checks. ALL must pass or the allocation is rejected.
import type { McResult } from "./montecarlo";
import { GROWTH_CAP } from "./allocate";

export interface GuardrailInput {
  growthPct: number;       // %
  maxDd: number;           // fraction
  mc: McResult;            // base-case Monte Carlo
  stress50: McResult;      // -50% stress
  stress80: McResult;      // -80% stress
  protocolScores: number[]; // min must be >= 60
  growthCap?: number;       // active strategy cap (fraction); defaults to GROWTH_CAP
}

export interface Check { name: string; passed: boolean; detail: string }
export interface GuardrailResult { passed: boolean; checks: Check[]; passedCount: number }

export function validate(i: GuardrailInput): GuardrailResult {
  const cap = i.growthCap ?? GROWTH_CAP;
  const checks: Check[] = [
    { name: "Growth cap", passed: i.growthPct / 100 <= cap, detail: `${i.growthPct.toFixed(0)}% ≤ ${(cap * 100).toFixed(0)}%` },
    { name: "VaR within limit", passed: i.mc.var95 <= i.maxDd, detail: `VaR95 ${(i.mc.var95 * 100).toFixed(1)}% ≤ ${(i.maxDd * 100).toFixed(0)}%` },
    { name: "Stress -50%", passed: i.stress50.var95 <= i.maxDd, detail: `${(i.stress50.var95 * 100).toFixed(1)}% ≤ ${(i.maxDd * 100).toFixed(0)}%` },
    { name: "Stress -80%", passed: i.stress80.var95 <= i.maxDd, detail: `${(i.stress80.var95 * 100).toFixed(1)}% ≤ ${(i.maxDd * 100).toFixed(0)}%` },
    { name: "Exploit test", passed: i.mc.cvar95 <= i.maxDd * 1.5, detail: `CVaR ${(i.mc.cvar95 * 100).toFixed(1)}%` },
    { name: "Protocol safety", passed: (i.protocolScores.length ? Math.min(...i.protocolScores) : 100) >= 60, detail: `min score ${i.protocolScores.length ? Math.min(...i.protocolScores) : "n/a"}` },
  ];
  const passedCount = checks.filter((c) => c.passed).length;
  return { passed: passedCount === checks.length, checks, passedCount };
}
