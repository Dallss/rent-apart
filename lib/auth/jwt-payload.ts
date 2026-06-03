/** Decode JWT payload (middle segment) for display only — not verified. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function pickEmailFromPayload(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const email = payload.email;
  return typeof email === "string" ? email : null;
}
