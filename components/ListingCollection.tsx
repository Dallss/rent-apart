"use client";

import Link from "next/link";
import { useMemo, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import ListingCard from "./ListingCard";

type ApiListing = {
  id: number;

  hero: {
    title: string;
    image: string;
    price: number;
    city: string;
  };

  listing_type: string;
  property_type: string;
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
    Error
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
    return data?.pages.flatMap((page) => page.results) ?? [];
  }, [data]);

  if (isLoading) {
    return <div>Loading listings...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="mb-8">
      <div className="ml-3 mb-3">
        <h1 className="font-playfair text-xl font-light tracking-wide">
          {title}
        </h1>
      </div>

      <ul className="flex w-full gap-3 overflow-x-auto overflow-y-hidden px-3">
        {listings.map((item) => (
          <li
            key={item.id}
            className="shrink-0"
          >
            <Link href={`/listings/${item.id}`}>
              <ListingCard item={item.hero} />
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