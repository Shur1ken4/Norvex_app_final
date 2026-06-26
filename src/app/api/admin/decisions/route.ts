import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { recentDecisions } from "@/lib/db";

export async function GET() {
  const store = await cookies();
  if (store.get("norvex_role")?.value !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const decisions = await recentDecisions(25);
    return NextResponse.json({ decisions });
  } catch {
    return NextResponse.json({ decisions: [] });
  }
}
