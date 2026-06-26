import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAnalytics } from "@/lib/db";

export async function GET() {
  const store = await cookies();
  if (store.get("norvex_role")?.value !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const data = await adminAnalytics();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
