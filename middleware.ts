import { NextRequest, NextResponse } from "next/server";

// Routes that require an active session
const PROTECTED = ["/dashboard", "/customer", "/payment"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get("lrr_session");
  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/customer/:path*", "/payment/:path*"],
};
