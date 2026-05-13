import { getPublicApiBaseUrl } from "@/lib/env";
import { decodeJwtPayload, pickEmailFromPayload } from "@/lib/jwt-payload";

const STORAGE_ACCESS = "ra_access_token";
const STORAGE_REFRESH = "ra_refresh_token";
const STORAGE_EMAIL = "ra_user_email";

export type GoogleAuthApiResponse = {
  access?: string;
  refresh?: string;
  token?: string;
  access_token?: string;
  user?: { email?: string };
};

function resolveAccessToken(data: GoogleAuthApiResponse): string | null {
  return (
    data.access ??
    data.token ??
    data.access_token ??
    null
  );
}

function resolveRefreshToken(data: GoogleAuthApiResponse): string | null {
  return data.refresh ?? null;
}

function resolveEmail(data: GoogleAuthApiResponse, idToken: string): string | null {
  const fromUser = data.user?.email;
  if (fromUser) return fromUser;
  const fromAccess = pickEmailFromPayload(decodeJwtPayload(resolveAccessToken(data) ?? ""));
  if (fromAccess) return fromAccess;
  return pickEmailFromPayload(decodeJwtPayload(idToken));
}

export async function postGoogleIdToken(idToken: string): Promise<GoogleAuthApiResponse> {
  const base = getPublicApiBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const res = await fetch(`${base}/api/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Auth failed (${res.status})`);
  }
  try {
    return JSON.parse(text) as GoogleAuthApiResponse;
  } catch {
    return {};
  }
}

export function readStoredSession(): {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
} {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, email: null };
  }
  return {
    accessToken: window.localStorage.getItem(STORAGE_ACCESS),
    refreshToken: window.localStorage.getItem(STORAGE_REFRESH),
    email: window.localStorage.getItem(STORAGE_EMAIL),
  };
}

export function persistSession(data: GoogleAuthApiResponse, idToken: string): void {
  const access = resolveAccessToken(data);
  const refresh = resolveRefreshToken(data);
  const email = resolveEmail(data, idToken);
  if (access) window.localStorage.setItem(STORAGE_ACCESS, access);
  else window.localStorage.removeItem(STORAGE_ACCESS);
  if (refresh) window.localStorage.setItem(STORAGE_REFRESH, refresh);
  else window.localStorage.removeItem(STORAGE_REFRESH);
  if (email) window.localStorage.setItem(STORAGE_EMAIL, email);
  else window.localStorage.removeItem(STORAGE_EMAIL);
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(STORAGE_ACCESS);
  window.localStorage.removeItem(STORAGE_REFRESH);
  window.localStorage.removeItem(STORAGE_EMAIL);
}

export function getAuthorizationHeader(): Record<string, string> {
  const { accessToken } = readStoredSession();
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}
