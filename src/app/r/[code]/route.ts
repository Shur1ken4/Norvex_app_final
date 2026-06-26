import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Referral entry point: capture the referrer's code in a cookie, then send the
// visitor to the waitlist. (While the site is password-gated, this only works
// for people who have the preview password; fully public at launch.)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const res = NextResponse.redirect(new URL("/waitlist", request.url));
  if (code) {
    res.cookies.set("norvex_ref", code, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return res;
}
