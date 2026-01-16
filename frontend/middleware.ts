import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// DEMO MODE – auth disabled
// All routes are allowed without authentication
// In production, uncomment authentication logic below
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // DEMO MODE – Allow all routes (user is always authenticated)
  // No redirects, no token checks
  // In production, uncomment the token check below:
  /*
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
