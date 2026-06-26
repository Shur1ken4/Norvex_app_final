import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logEvent } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.type) return NextResponse.json({ ok: false });
    await logEvent({
      wallet_address: body.wallet_address ?? null,
      type: String(body.type),
      screen: body.screen ?? null,
      meta: body.meta ?? {},
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
