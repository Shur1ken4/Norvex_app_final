import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { listConfigs, saveConfig, activateConfig } from "@/lib/db";

async function requireAdmin() {
  const store = await cookies();
  return store.get("norvex_role")?.value === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ versions: await listConfigs() });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (body.activate) {
    await activateConfig(String(body.activate));
  } else {
    const growthCap = Math.min(0.5, Math.max(0.05, Number(body.growthCap) || 0.25));
    await saveConfig(growthCap, String(body.note ?? "Updated strategy"));
  }
  return NextResponse.json({ versions: await listConfigs() });
}
