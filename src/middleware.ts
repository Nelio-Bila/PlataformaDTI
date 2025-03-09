// // src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { DEFAULT_REDIRECT, PUBLIC_ROUTES, ROOT } from "@/lib/routes";

// Use NextAuth's auth middleware
export default auth((req: NextRequest & { auth?: any }) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  // Check if session exists and is not expired
  if (isAuthenticated && req.auth?.expires) {
    const expiresDate = new Date(req.auth.expires);
    if (expiresDate < new Date()) {
      const loginUrl = new URL(ROOT, nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL(ROOT, nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

