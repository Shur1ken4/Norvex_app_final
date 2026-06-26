import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { monteCarlo } from "@/lib/quant/montecarlo";
import { scenarios, computeAllocation } from "@/lib/quant/allocate";
import { validate } from "@/lib/quant/guardrails";
import { assetParams, stressed, SAFE_APY } from "@/lib/quant/assets";
import { getAssetVol } from "@/lib/market";
import { parseGoal, runDebate, type ParsedGoal } from "@/lib/ai/agents";
import { logDecision, getActiveConfig } from "@/lib/db";

export const maxDuration = 30;

// Deterministic fallback parse when the LLM/AI Gateway is unavailable.
function fallbackParse(goal: string, asset?: string, amount?: number): ParsedGoal {
  const g = (goal || "").toLowerCase();
  const amt = amount ?? (() => {
    const m = g.replace(/,/g, "").match(/\$?\s*(\d{1,7})\s*(k)?/);
    if (!m) return 10000;
    return Math.max(1, Number(m[1]) * (m[2] ? 1000 : 1));
  })();
  const ddMatch = g.match(/(\d{1,2})\s*%/);
  const maxDd = ddMatch ? Math.min(0.25, Math.max(0.01, Number(ddMatch[1]) / 100)) : 0.05;
  const a = (asset || (g.includes("eth") ? "ETH" : g.includes("btc") ? "BTC" : "SOL")) as ParsedGoal["asset"];
  return { amount: amt, asset: a, maxDd, riskScore: Math.round(maxDd * 400), horizonDays: 365 };
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const goal: string = String(body.goal ?? "");
    let mode: "live" | "fallback" = "live";

    // 1) Parse goal (LLM → fallback).
    let parsed: ParsedGoal;
    try {
      parsed = await parseGoal(goal);
    } catch {
      mode = "fallback";
      parsed = fallbackParse(goal, body.asset, body.amount);
    }
    parsed.maxDd = Math.min(0.25, Math.max(0.01, parsed.maxDd || 0.05));
    // Honor an explicit asset choice from the UI selector over the LLM default.
    if (body.asset && ["SOL", "ETH", "BTC"].includes(body.asset)) parsed.asset = body.asset;
    const params = { ...assetParams(parsed.asset) };
    // Override static volatility with live (cached) realized vol when available.
    const mkt = await getAssetVol(parsed.asset);
    if (mkt.vol && isFinite(mkt.vol)) params.vol = mkt.vol;
    const dataLive = mkt.live;

    // 2) Risk-budget allocation (growth ≈ max_dd + yield buffer, capped 25%),
    //    then validate with Monte Carlo, sweeping growth DOWN until VaR95 ≤ max_dd.
    const cfg = await getActiveConfig();
    const base = computeAllocation({ amount: parsed.amount, maxDd: parsed.maxDd, safeApy: SAFE_APY, horizonDays: parsed.horizonDays, growthCap: cfg.growthCap });
    let ceilGrowth = Math.max(1, Math.round(base.growthPct));
    let ceilMc = monteCarlo({ safePct: 100 - ceilGrowth, growthPct: ceilGrowth, asset: params, safeApy: SAFE_APY, horizonDays: parsed.horizonDays });
    while (ceilGrowth > 0 && ceilMc.var95 > parsed.maxDd) {
      ceilGrowth -= 1;
      ceilMc = monteCarlo({ safePct: 100 - ceilGrowth, growthPct: ceilGrowth, asset: params, safeApy: SAFE_APY, horizonDays: parsed.horizonDays });
    }

    // 3) Bull/Bear/PM debate (LLM → fallback), clamped to the validated ceiling.
    let debate;
    try {
      if (mode === "fallback") throw new Error("skip-llm");
      debate = await runDebate({
        asset: parsed.asset, maxDd: parsed.maxDd,
        mcOptimalGrowthPct: ceilGrowth, var95: ceilMc.var95, sharpe: ceilMc.sharpe,
      });
    } catch {
      mode = mode === "live" ? "fallback" : mode;
      debate = {
        bullCase: `Low recent ${parsed.asset} vol supports more growth.`,
        bullConfidence: 65,
        bearCase: "Crash history argues for a smaller growth sleeve.",
        bearConfidence: 90,
        decisionGrowthPct: ceilGrowth,
        pmRationale: `Bear stronger given a ${(parsed.maxDd * 100).toFixed(0)}% max-loss limit; growth set to the validated ceiling of ${ceilGrowth}%.`,
      };
    }
    const growthPct = Math.min(debate.decisionGrowthPct, ceilGrowth);
    const safePct = 100 - growthPct;

    // 4) Final Monte Carlo at the chosen split + stress tests for guardrails.
    const finalMc = monteCarlo({ safePct, growthPct, asset: params, safeApy: SAFE_APY, horizonDays: parsed.horizonDays });
    const s50 = monteCarlo({ safePct, growthPct, asset: stressed(params, 0.5), safeApy: SAFE_APY, horizonDays: parsed.horizonDays });
    const s80 = monteCarlo({ safePct, growthPct, asset: stressed(params, 0.8), safeApy: SAFE_APY, horizonDays: parsed.horizonDays });
    const guard = validate({ growthPct, maxDd: parsed.maxDd, mc: finalMc, stress50: s50, stress80: s80, protocolScores: [87, 74], growthCap: cfg.growthCap });

    // 5) Reasoning — reuse the PM's rationale from the debate (no extra LLM call).
    const reasoning = (debate.pmRationale && debate.pmRationale.trim()) ||
      `${safePct.toFixed(0)}% sits in a yield-bearing safe leg; ${growthPct.toFixed(0)}% captures ${parsed.asset} upside. Max loss is about $${Math.round(parsed.amount * parsed.maxDd).toLocaleString()} (${(parsed.maxDd * 100).toFixed(0)}%).`;

    const latencyMs = Date.now() - started;
    const costUsd = mode === "live" ? 0.03 : 0;
    const scn = scenarios(parsed.amount, growthPct, SAFE_APY, parsed.horizonDays);

    const result = {
      mode,
      dataLive,
      assetVol: params.vol,
      parsed,
      allocation: { safePct, growthPct, safe: parsed.amount * safePct / 100, growth: parsed.amount * growthPct / 100 },
      mc: { var95: finalMc.var95, cvar95: finalMc.cvar95, sharpe: finalMc.sharpe, maxDD: finalMc.maxDD },
      scenarios: scn,
      debate,
      guardrails: { passed: guard.passed, passedCount: guard.passedCount, checks: guard.checks },
      reasoning,
      maxLossUsd: Math.round(parsed.amount * parsed.maxDd),
      latencyMs,
      costUsd,
    };

    logDecision({
      wallet_address: body.wallet_address ?? null,
      goal,
      parsed,
      allocation: result.allocation,
      mc: result.mc,
      transcript: debate,
      guardrails_passed: guard.passedCount,
      cost: costUsd,
      latency_ms: latencyMs,
      model: mode === "live" ? "claude" : "deterministic-fallback",
    }).catch(() => {});

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "brain_error" }, { status: 500 });
  }
}
