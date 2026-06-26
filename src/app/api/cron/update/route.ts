import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tickPortfolios } from "@/lib/db";

// Invoked by Vercel Cron (see vercel.json). Protected by CRON_SECRET when set.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  try {
    const updated = await tickPortfolios();
    return NextResponse.json({ ok: true, updated });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
