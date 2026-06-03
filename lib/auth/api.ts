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