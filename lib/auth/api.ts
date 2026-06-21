export type LeasingCapabilities = {
   lessee: boolean;
   manage: boolean;
};

export type AuthCapabilities = {
   leasing: LeasingCapabilities;
};

export type AuthProfile = {
   email: string;
   display_name: string;
   capabilities: AuthCapabilities;
   phone: string;
   avatar_url: string;
   birthday: string | null;
   needs_onboarding: boolean;
};

export type GoogleAuthUser = {
   email: string;
   username: string;
   capabilities: AuthCapabilities;
};

export type GoogleAuthResponse = {
   user: GoogleAuthUser;
   needs_onboarding: boolean;
};

export type MeResponse = {
   profile: AuthProfile;
};

export type OnboardingPayload = {
   display_name: string;
   birthday: string;
   phone: string;
};

export type OnboardingResponse = {
   success: boolean;
   profile: Pick<AuthProfile, "display_name" | "birthday" | "phone">;
   needs_onboarding: boolean;
};

const CONFIG_URL = "/api/config";

let cachedApiUrl: string | null = null;

async function getApiUrl(): Promise<string> {
   if (cachedApiUrl) return cachedApiUrl;

   const configRes = await fetch(CONFIG_URL, { cache: "no-store" });
   if (!configRes.ok) {
      throw new Error(`Failed to load app config (${configRes.status})`);
   }

   const config = (await configRes.json()) as { apiUrl?: string };
   if (!config.apiUrl) {
      throw new Error("BACKEND_API_URL is not configured");
   }

   cachedApiUrl = config.apiUrl;
   return cachedApiUrl;
}

export async function fetchApi(
   input: string,
   init?: RequestInit,
): Promise<Response> {
   const apiUrl = await getApiUrl();

   return fetch(`${apiUrl}${input}`, {
      credentials: "include",
      ...init,
      headers: {
         Accept: "application/json",
         ...(init?.headers ?? {}),
      },
   });
}

export async function postGoogleIdToken(
   idToken: string,
): Promise<GoogleAuthResponse> {
   const res = await fetchApi("/api/auth/google/", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: idToken }),
   });

   const text = await res.text();
   if (!res.ok) {
      throw new Error(text || `Auth failed (${res.status})`);
   }

   return JSON.parse(text) as GoogleAuthResponse;
}

export async function getCurrentSession(): Promise<AuthProfile | null> {
   const res = await fetchApi("/api/auth/me", {
      method: "GET",
      cache: "no-store",
   });

   if (res.status === 401 || res.status === 403) {
      return null;
   }

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to fetch session (${res.status})`);
   }

   const data = (await res.json()) as MeResponse;
   return data.profile;
}

export async function submitOnboarding(
   payload: OnboardingPayload,
): Promise<OnboardingResponse> {
   const res = await fetchApi("/api/auth/onboarding/", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
   });

   const text = await res.text();
   if (!res.ok) {
      throw new Error(text || `Onboarding failed (${res.status})`);
   }

   return JSON.parse(text) as OnboardingResponse;
}
