import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addToWaitlist } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "").trim();
    if (!email.includes("@")) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    const referredBy = body.referred_by ? String(body.referred_by) : null;
    const result = await addToWaitlist(email, referredBy);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ position: 247, stored: false, referral_code: null, referrals: 0 });
  }
}
