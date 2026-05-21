import { decodeJwtPayload, pickEmailFromPayload } from "@/lib/jwt-payload";

const STORAGE_ACCESS = "ra_access_token";
const STORAGE_REFRESH = "ra_refresh_token";
const STORAGE_EMAIL = "ra_user_email";
const STORAGE_CAN_MANAGE_LEASES = "ra_can_manage_leases";

export type GoogleAuthApiResponse = {
  access?: string;
  refresh?: string;
  token?: string;
  access_token?: string;
  user?: {
    email?: string;
    capabilities?: {
      leasing?: {
        lessee?: boolean;
        manage?: boolean;
      };
    };
  };
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

function resolveCanManageLeases(data: GoogleAuthApiResponse): boolean {
  return data.user?.capabilities?.leasing?.manage ?? false;
}

export async function postGoogleIdToken(idToken: string): Promise<GoogleAuthApiResponse> {
  const configRes = await fetch("/api/config");
  const config = await configRes.json();

  const res = await fetch(`${config.apiUrl}/api/auth/google/`, {
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
  canManageLeases: boolean;
} {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, email: null, canManageLeases: false };
  }
  return {
    accessToken: window.localStorage.getItem(STORAGE_ACCESS),
    refreshToken: window.localStorage.getItem(STORAGE_REFRESH),
    email: window.localStorage.getItem(STORAGE_EMAIL),
    canManageLeases: window.localStorage.getItem(STORAGE_CAN_MANAGE_LEASES) === "true",
  };
}

export function persistSession(data: GoogleAuthApiResponse, idToken: string): void {
  const access = resolveAccessToken(data);
  const refresh = resolveRefreshToken(data);
  const email = resolveEmail(data, idToken);
  const canManageLeases = resolveCanManageLeases(data);

  if (access) window.localStorage.setItem(STORAGE_ACCESS, access);
  else window.localStorage.removeItem(STORAGE_ACCESS);
  if (refresh) window.localStorage.setItem(STORAGE_REFRESH, refresh);
  else window.localStorage.removeItem(STORAGE_REFRESH);
  if (email) window.localStorage.setItem(STORAGE_EMAIL, email);
  else window.localStorage.removeItem(STORAGE_EMAIL);
  window.localStorage.setItem(STORAGE_CAN_MANAGE_LEASES, String(canManageLeases));
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(STORAGE_ACCESS);
  window.localStorage.removeItem(STORAGE_REFRESH);
  window.localStorage.removeItem(STORAGE_EMAIL);
  window.localStorage.removeItem(STORAGE_CAN_MANAGE_LEASES);
}

export function getAuthorizationHeader(): Record<string, string> {
  const { accessToken } = readStoredSession();
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}