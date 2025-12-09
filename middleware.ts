// middleware.ts (ที่ root โปรเจ็กต์)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/user", "/admin"];

export function middleware(req: NextRequest) {
  const isProtected = PROTECTED.some(p => req.nextUrl.pathname.startsWith(p));
  const hasSession =
    req.cookies.get("sb-access-token") || req.cookies.get("sb-refresh-token");

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // กันแคชทุกอย่างใต้ /user และ /admin
  if (isProtected) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  }

  return NextResponse.next();
}
