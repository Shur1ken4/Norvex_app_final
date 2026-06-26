import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { closePortfolio } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? "");
    const wallet = String(body.wallet_address ?? "");
    if (!id || !wallet) return NextResponse.json({ closed: false });
    const closed = await closePortfolio(id, wallet);
    return NextResponse.json({ closed });
  } catch {
    return NextResponse.json({ closed: false });
  }
}
