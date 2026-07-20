// ============================================================================
// Middleware — defense-in-depth guard for admin API routes.
// NextAuth session is checked at the API layer; this adds a fast pre-check
// that blocks unauthenticated requests before they reach the handler.
// ============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin API routes (not the auth endpoints themselves)
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/auth")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized — authentication required" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
