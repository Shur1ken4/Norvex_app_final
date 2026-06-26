import { NextResponse } from "next/server";
import { getProtocols } from "@/lib/market";

export const maxDuration = 20;

export async function GET() {
  try {
    const protocols = await getProtocols();
    return NextResponse.json({ protocols });
  } catch {
    return NextResponse.json({ protocols: [] });
  }
}
