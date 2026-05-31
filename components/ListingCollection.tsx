"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";

import ListingLoading from "./ListingLoading";
import ListingCard from "./ListingCard";

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

type ListingsSectionProps = {
  title: string;
  api: string;
};

export default function ListingCollection({
  title,
  api,
}: ListingsSectionProps) {
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
    queryKey: ["listings", api],

    initialPageParam: api,

    queryFn: async ({ pageParam }) => {
      const res = await fetch(pageParam);

      if (!res.ok) {
        throw new Error("Failed to fetch listings");
      }

      return res.json();
    },

    getNextPageParam: (lastPage) => {
      return lastPage.next ?? undefined;
    },
  });

  const listings = useMemo(() => {
    return (
      data?.pages.flatMap((page) => page.results) ?? []
    );
  }, [data]);

  const formattedListings = listings.map((item) => ({
    id: String(item.id),
    title: item.title,
    neighborhood: item.city,
    rent: item.monthly_rent,
    bedrooms: Number(item.bedrooms),
    hero_image: item.hero_image,
    rating:
      item.rating == null
        ? null
        : String(item.rating),
    blurb: "",
  }));

  if (isLoading) {
    return <ListingLoading />;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="mb-8">
      <div className="ml-3 mb-3">
        <h1 className="text-xl font-thin tracking-wide">
          {title}
        </h1>
      </div>

      <ul className="flex w-full gap-3 overflow-x-auto overflow-y-hidden px-3 scrollbar-hide">
        {formattedListings.map((item) => (
          <li
            key={item.id}
            className="shrink-0"
          >
            <Link href={`/listings/${item.id}`}>
              <ListingCard item={item} />
            </Link>
          </li>
        ))}

        {hasNextPage && (
          <li className="flex items-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded border px-4 py-2 text-sm"
            >
              {isFetchingNextPage
                ? "Loading..."
                : "Load more"}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}