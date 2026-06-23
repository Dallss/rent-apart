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
   return Boolean(request.cookies.get("access_token")?.value);
}

export function proxy(request: NextRequest) {
   const { pathname } = request.nextUrl;

   const requiresAuth = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
   );

   if (!requiresAuth || hasAuthCookie(request)) return NextResponse.next();

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
