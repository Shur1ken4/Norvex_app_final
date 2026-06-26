import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPortfolio } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const wallet = String(body.wallet_address ?? "").trim();
    if (!wallet) {
      return NextResponse.json(
        { stored: false, id: null, error: "missing_wallet_address" },
        { status: 400 }
      );
    }
    const { id, stored } = await createPortfolio({
      wallet_address: wallet,
      name: (body.name as string | null) ?? null,
      asset: (body.asset as string | null) ?? "SOL",
      goal_text: (body.goal_text as string | null) ?? null,
      amount: body.amount != null ? Number(body.amount) : null,
      max_drawdown: body.max_drawdown != null ? Number(body.max_drawdown) : null,
      safe_pct: body.safe_pct != null ? Number(body.safe_pct) : 92,
      growth_pct: body.growth_pct != null ? Number(body.growth_pct) : 8,
      origin: (body.origin as string | null) ?? "consumer",
      is_demo: (body.is_demo as boolean | undefined) ?? true,
    });
    if (!stored) {
      // DB unconfigured — return 200 so client doesn't error, but flag it.
      return NextResponse.json({ stored: false, id: null, error: "db_unconfigured" });
    }
    return NextResponse.json({ stored, id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[api/portfolio] POST failed:", msg);
    return NextResponse.json({ stored: false, id: null, error: msg }, { status: 500 });
  }
}
