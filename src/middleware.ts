// import { authConfig } from "@/auth.config";
// import NextAuth from "next-auth";
// import { DEFAULT_REDIRECT, PUBLIC_ROUTES, ROOT } from "@/lib/routes";

// const { auth } = NextAuth(authConfig);

// export default auth((req) => {
//   const { nextUrl } = req;

//   const isAuthenticated = !!req.auth;
//   const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

//   if (isPublicRoute && isAuthenticated)
//     return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl));

//   if (!isAuthenticated && !isPublicRoute)
//     return Response.redirect(new URL(ROOT, nextUrl));
// });

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };








import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { DEFAULT_REDIRECT, PUBLIC_ROUTES, ROOT } from "@/lib/routes";
// import { AuthenticatedRequest } from "next-auth/middleware";

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