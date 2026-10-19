import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/hyrje") return NextResponse.next();

  const ok = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!ok) return NextResponse.redirect(new URL("/admin/hyrje", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
