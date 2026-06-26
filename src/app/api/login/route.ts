import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const from = String(form.get("from") ?? "/") || "/";
  const expected = process.env.SITE_PASSWORD;

  if (!expected || password !== expected) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    if (from && from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const dest = from.startsWith("/") ? from : "/";
  const res = NextResponse.redirect(new URL(dest, request.url), { status: 303 });
  res.cookies.set("norvex_auth", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
