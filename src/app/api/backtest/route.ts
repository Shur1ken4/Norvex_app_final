import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { monteCarlo } from "@/lib/quant/montecarlo";
import { assetParams, SAFE_APY } from "@/lib/quant/assets";

export const maxDuration = 30;

const HORIZONS: Record<string, number> = { "0": 182, "1": 365, "2": 730, "3": 1095 };

export async function GET(request: NextRequest) {
  const store = await cookies();
  if (store.get("norvex_role")?.value !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const range = request.nextUrl.searchParams.get("range") ?? "1";
  const days = HORIZONS[range] ?? 365;
  const sol = assetParams("SOL");

  const strategies = [
    { name: "Norvex AI (92/8)", safePct: 92, growthPct: 8, best: true },
    { name: "100% Safe (Kamino)", safePct: 100, growthPct: 0 },
    { name: "100% Growth (SOL)", safePct: 0, growthPct: 100 },
    { name: "50/50 Equal", safePct: 50, growthPct: 50 },
  ].map((s) => {
    const mc = monteCarlo({ safePct: s.safePct, growthPct: s.growthPct, asset: sol, safeApy: SAFE_APY, horizonDays: days });
    return {
      name: s.name,
      best: !!s.best,
      ret: (mc.mean >= 0 ? "+" : "") + (mc.mean * 100).toFixed(1) + "%",
      sharpe: mc.sharpe.toFixed(2),
      dd: "-" + (mc.maxDD * 100).toFixed(1) + "%",
    };
  });

  return NextResponse.json({ days, strategies });
}
