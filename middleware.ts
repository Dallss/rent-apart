import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAMES = [
   "sessionid",
   "csrftoken",
   "access_token",
   "refresh_token",
   "auth",
];

const PROTECTED_ROUTES = ["/become-a-host", "/manage-listings", "/onboarding"];

function hasAuthCookie(request: NextRequest): boolean {
   return AUTH_COOKIE_NAMES.some((name) =>
      Boolean(request.cookies.get(name)?.value),
   );
}

export function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;

   const requiresAuth = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
   );

   if (!requiresAuth) {
      return NextResponse.next();
   }

   if (hasAuthCookie(request)) {
      return NextResponse.next();
   }

   const url = request.nextUrl.clone();
   url.pathname = "/";
   url.searchParams.set("auth", "required");
   return NextResponse.redirect(url);
}

export const config = {
   matcher: [
      "/become-a-host/:path*",
      "/manage-listings/:path*",
      "/onboarding/:path*",
   ],
};
