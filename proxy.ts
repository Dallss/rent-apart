import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
   "/become-a-host",
   "/manage-listings",
   "/onboarding",
];

function isAuthenticated(request: NextRequest): boolean {
   return request.cookies.get("authenticated")?.value === "true";
}

export function proxy(request: NextRequest) {
   const { pathname } = request.nextUrl;

   const requiresAuth = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
   );

   if (!requiresAuth || isAuthenticated(request)) {
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
