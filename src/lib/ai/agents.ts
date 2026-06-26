// LLM agents — the 3 judgment agents (parse, debate, explain). Routed through
// the Vercel AI Gateway by passing a "provider/model" string to the AI SDK.
// Each throws on failure; the orchestrator catches and falls back to deterministic defaults.
import { generateText, Output } from "ai";
import { z } from "zod";

const CHEAP = "anthropic/claude-haiku-4.5";
const SMART = "anthropic/claude-sonnet-4.6";

const ParsedGoal = z.object({
  amount: z.number().describe("USD amount to invest; default 10000 if unspecified"),
  asset: z.enum(["SOL", "ETH", "BTC"]).describe("growth asset; default SOL"),
  maxDd: z.number().describe("max acceptable drawdown as a fraction 0.01-0.25; default 0.05"),
  riskScore: z.number().describe("0-100 risk tolerance"),
  horizonDays: z.number().describe("time horizon in days; default 365"),
});
export type ParsedGoal = z.infer<typeof ParsedGoal>;

export async function parseGoal(goal: string): Promise<ParsedGoal> {
  const { output } = await generateText({
    model: CHEAP,
    output: Output.object({ schema: ParsedGoal }),
    prompt:
      "Extract investment parameters from this goal. Be conservative when ambiguous. " +
      "Clamp maxDd to [0.01, 0.25].\n\nGoal: " + goal,
  });
  return output;
}

const Debate = z.object({
  bullCase: z.string(),
  bullConfidence: z.number(),
  bearCase: z.string(),
  bearConfidence: z.number(),
  decisionGrowthPct: z.number().describe("chosen growth allocation %, MUST be <= mcOptimalGrowthPct"),
  pmRationale: z.string(),
});
export type Debate = z.infer<typeof Debate>;

export async function runDebate(ctx: {
  asset: string; maxDd: number; mcOptimalGrowthPct: number; var95: number; sharpe: number;
}): Promise<Debate> {
  const { output } = await generateText({
    model: SMART,
    output: Output.object({ schema: Debate }),
    prompt:
      `You are Norvex's Bull/Bear/PM committee allocating a principal-protected note.\n` +
      `Asset: ${ctx.asset}. User max drawdown: ${(ctx.maxDd * 100).toFixed(0)}%.\n` +
      `Deterministic Monte Carlo says optimal growth allocation = ${ctx.mcOptimalGrowthPct}% ` +
      `(VaR95 ${(ctx.var95 * 100).toFixed(1)}%, Sharpe ${ctx.sharpe.toFixed(2)}).\n` +
      `First argue the BULL case (more growth), then the BEAR case (less growth), each with a ` +
      `confidence 0-100. Then DECIDE a growth %. The decision MUST NOT exceed the Monte Carlo ` +
      `optimal of ${ctx.mcOptimalGrowthPct}% — the model overrides the LLM on risk. Give a 2-sentence rationale.`,
  });
  // Hard clamp: the LLM can never exceed the deterministic optimum.
  output.decisionGrowthPct = Math.min(output.decisionGrowthPct, ctx.mcOptimalGrowthPct);
  return output;
}

export async function explain(ctx: {
  asset: string; safePct: number; growthPct: number; amount: number; maxDd: number;
}): Promise<string> {
  const { text } = await generateText({
    model: CHEAP,
    prompt:
      `Explain this principal-protected portfolio to a first-time investor in 2 plain-English ` +
      `sentences. No jargon, no promises of returns, and state the max loss in dollars.\n` +
      `${ctx.safePct.toFixed(0)}% safe / ${ctx.growthPct.toFixed(0)}% ${ctx.asset} growth on $${ctx.amount.toLocaleString()}, ` +
      `max loss ${(ctx.maxDd * 100).toFixed(0)}% ($${Math.round(ctx.amount * ctx.maxDd).toLocaleString()}).`,
  });
  return text.trim();
}
