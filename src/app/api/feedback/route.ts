import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addFeedback } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message ?? "").trim();
    const nps = body.nps_score != null ? Number(body.nps_score) : null;
    if (!message && nps == null) {
      return NextResponse.json({ error: "empty" }, { status: 400 });
    }
    const stored = await addFeedback({
      wallet_address: body.wallet_address ?? null,
      screen: body.screen ?? null,
      message: message || "(nps only)",
      nps_score: nps,
    });
    return NextResponse.json({ stored });
  } catch {
    return NextResponse.json({ stored: false });
  }
}
