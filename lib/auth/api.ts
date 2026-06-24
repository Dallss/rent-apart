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
   liked_listings: number[];
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

let isRefreshing = false;
let refreshQueue: Array<(success: boolean) => void> = [];

async function refreshToken(): Promise<boolean> {
   try {
      const res = await fetch(`${await getApiUrl()}/api/auth/token/refresh/`, {
         method: "POST",
         credentials: "include",
      });
      console.log("[fetchApi] refresh →", res.status);
      return res.ok;
   } catch (err) {
      console.error("[fetchApi] refresh failed:", err);
      return false;
   }
}

export async function fetchApi(
   input: string,
   init?: RequestInit,
): Promise<Response> {
   const apiUrl = await getApiUrl();

   const doFetch = () =>
      fetch(`${apiUrl}${input}`, {
         credentials: "include",
         ...init,
         headers: {
            Accept: "application/json",
            ...(init?.headers ?? {}),
         },
      });

   console.log("[fetchApi]", init?.method ?? "GET", input);
   const response = await doFetch();
   console.log("[fetchApi] response →", response.status, input);

   if (response.status !== 401) return response;

   console.warn("[fetchApi] 401 on", input, "— attempting refresh");

   if (isRefreshing) {
      console.log("[fetchApi] refresh already in flight, queuing:", input);
      return new Promise((resolve) => {
         refreshQueue.push((success) => {
            console.log(
               "[fetchApi] queue flushed for",
               input,
               "— success:",
               success,
            );
            resolve(success ? doFetch() : response);
         });
      });
   }

   isRefreshing = true;
   const success = await refreshToken();
   isRefreshing = false;

   console.log(
      "[fetchApi] refresh result:",
      success,
      "— flushing",
      refreshQueue.length,
      "queued request(s)",
   );
   refreshQueue.forEach((cb) => cb(success));
   refreshQueue = [];

   if (!success) {
      console.error("[fetchApi] refresh failed, returning 401 for:", input);
      return response;
   }

   console.log("[fetchApi] retrying after refresh:", input);
   return doFetch();
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

export async function logout(): Promise<void> {
   await fetchApi("/api/auth/logout/", {
      method: "POST",
   });
}

export async function likeListingApi(listingId: number): Promise<void> {
   const res = await fetchApi(`/api/listings/${listingId}/like/`, {
      method: "POST",
   });
   if (!res.ok) throw new Error(`Failed to like listing (${res.status})`);
}

export async function unlikeListingApi(listingId: number): Promise<void> {
   const res = await fetchApi(`/api/listings/${listingId}/like/`, {
      method: "DELETE",
   });
   if (!res.ok) throw new Error(`Failed to unlike listing (${res.status})`);
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
