import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

type Role = "user" | "admin" | "b2b";

async function currentRole(): Promise<Role> {
  const store = await cookies();
  const r = store.get("norvex_role")?.value;
  return r === "admin" || r === "b2b" ? r : "user";
}

export async function GET() {
  return NextResponse.json({ role: await currentRole() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? "");
  let role: Role | null = null;
  if (process.env.ADMIN_CODE && code === process.env.ADMIN_CODE) role = "admin";
  else if (process.env.B2B_CODE && code === process.env.B2B_CODE) role = "b2b";

  if (!role) return NextResponse.json({ error: "invalid_code" }, { status: 401 });

  const res = NextResponse.json({ role });
  res.cookies.set("norvex_role", role, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ role: "user" });
  res.cookies.set("norvex_role", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
