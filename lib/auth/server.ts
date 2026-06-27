import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthProfile, MeResponse } from "@/lib/auth/api";

const AUTH_COOKIE_NAMES = [
   "sessionid",
   "csrftoken",
   "access_token",
   "refresh_token",
   "auth",
];

function getBackendApiUrl(): string {
   const apiUrl = process.env.BACKEND_API_URL;
   if (!apiUrl) {
      throw new Error("BACKEND_API_URL is not configured");
   }
   return apiUrl;
}

async function buildCookieHeader(): Promise<string> {
   const store = await cookies();

   return AUTH_COOKIE_NAMES.map((name) => {
      const value = store.get(name)?.value;
      return value ? `${name}=${value}` : null;
   })
      .filter(Boolean)
      .join("; ");
}

export async function getServerSessionProfile(): Promise<AuthProfile | null> {
   const cookieHeader = await buildCookieHeader();
   if (!cookieHeader) return null;

   const res = await fetch(`${getBackendApiUrl()}/api/auth/me`, {
      method: "GET",
      headers: {
         Accept: "application/json",
         Cookie: cookieHeader,
      },
      cache: "no-store",
   });

   if (res.status === 401 || res.status === 403) {
      return null;
   }

   if (!res.ok) {
      throw new Error(`Failed to fetch server session (${res.status})`);
   }

   const data = (await res.json()) as MeResponse;
   return data.profile;
}

export async function requireAuthenticatedUser(
   redirectTo = "/",
): Promise<AuthProfile> {
   const profile = await getServerSessionProfile();
   console.log("DEBUG LOG BELOW");
   console.log(profile);
   if (!profile) {
      redirect(redirectTo);
   }
   return profile;
}

export async function requireCompletedOnboarding(
   redirectTo = "/onboarding",
): Promise<AuthProfile> {
   const profile = await requireAuthenticatedUser();
   if (profile.needs_onboarding) {
      redirect(redirectTo);
   }
   return profile;
}

export async function requireHostUser(
   redirectTo = "/become-a-host",
): Promise<AuthProfile> {
   const profile = await requireCompletedOnboarding();
   if (!profile.capabilities.leasing.manage) {
      redirect(redirectTo);
   }
   return profile;
}
