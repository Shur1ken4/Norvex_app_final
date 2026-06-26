import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listPortfolios } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet") ?? "";
    if (!wallet) return NextResponse.json({ portfolios: [] });
    const portfolios = await listPortfolios(wallet);
    return NextResponse.json({ portfolios });
  } catch {
    return NextResponse.json({ portfolios: [] });
  }
}
