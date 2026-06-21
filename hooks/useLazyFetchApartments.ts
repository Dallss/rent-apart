// TODO: Deprecate this. this is terrible abstraction.
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

interface FetchParams {
   api: string;
   params?: ListingQueryParams;
}

type ListingQueryParams = {
   bathrooms?: number;
   bedrooms?: number;
   city?: string;
   is_available?: boolean;
   limit?: number;
   offset?: number;
   ordering?: string;
   search?: string;
};

type ApiListing = {
   id: number;
   title: string;
   hero_image: string;
   monthly_rent: number;
   city: string;
   bedrooms: string;
   rating: number;
};

type PaginatedResponse<T> = {
   count: number;
   next: string | null;
   previous: string | null;
   results: T[];
};

export type { ListingQueryParams, FetchParams };

function buildListingsUrl(
   baseUrl: string,
   params: ListingQueryParams = {},
): string {
   const searchParams = new URLSearchParams();

   Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
         searchParams.append(key, String(value));
      }
   });

   const queryString = searchParams.toString();

   return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
const authFetch = async (url: string, options: RequestInit = {}) => {
   const res = await fetch(url, {
      ...options,
      credentials: "include", // IMPORTANT: sends cookies
      headers: {
         ...(options.headers || {}),
         "Content-Type": "application/json",
      },
   });

   if (!res.ok) throw new Error("Request failed");
   return res;
};

function useLazyFetch({ api, params }: FetchParams) {
   const url = buildListingsUrl(api, params);

   const {
      data,
      isLoading,
      isError,
      error,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
   } = useInfiniteQuery<
      PaginatedResponse<ApiListing>,
      Error,
      InfiniteData<PaginatedResponse<ApiListing>>,
      [string, string],
      string
   >({
      queryKey: ["listings", url],

      initialPageParam: url,

      queryFn: async ({ pageParam }) => {
         const res = await authFetch(pageParam);

         if (!res.ok) {
            throw new Error("Failed to fetch listings");
         }

         return res.json();
      },

      getNextPageParam: (lastPage) => {
         return lastPage.next ?? undefined;
      },
   });

   return {
      data,
      isLoading,
      isError,
      error,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
   };
}

export default useLazyFetch;
