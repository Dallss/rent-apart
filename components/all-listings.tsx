"use client";

import { useEffect, useState } from "react";

type ApiListing = {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  monthly_rent: string;
  bedrooms: number;
  bathrooms: number;
  is_available: boolean;
  created_at: string;
  images: {
    id: number;
    image: string;
    is_primary: boolean;
  }[];
  landlord_email: string;
};

type Listing = {
  id: string;
  title: string;
  neighborhood: string;
  rent: number;
  bedrooms: number;
  sqft: number;
  blurb: string;
  image?: string;
};

function formatRent(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AllListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);

        // 1. get runtime config first
        const configRes = await fetch("/api/config");
        const config = await configRes.json();

        // 2. use runtime API URL
        const res = await fetch(`${config.apiUrl}/api/listings/`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data: ApiListing[] = await res.json();

        const mapped: Listing[] = data.map((item) => ({
          id: String(item.id),
          title: item.title,
          neighborhood: item.city, // or address if you prefer
          rent: Number(item.monthly_rent),
          bedrooms: item.bedrooms,
          sqft: 0, // backend doesn’t provide yet
          blurb: item.description,
          image: item.images?.[0]?.image,
        }));

        setListings(mapped);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Browse apartments
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Live listings from backend (Django API).
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <p className="text-sm text-zinc-500">Loading listings...</p>
        )}

        {/* Error state */}
        {error && (
          <p className="text-sm text-red-500">
            Error: {error}
          </p>
        )}

        {/* Listings */}
        {!loading && !error && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <li key={item.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">

                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h2 className="text-base font-semibold">
                      {item.title}
                    </h2>

                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {item.neighborhood}
                    </p>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {item.blurb}
                    </p>

                    <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <div>
                        <dd className="font-semibold text-foreground">
                          {formatRent(item.rent)}
                        </dd>
                        <span className="text-zinc-500"> / mo</span>
                      </div>

                      <div>
                        <dd>
                          {item.bedrooms === 0
                            ? "Studio"
                            : `${item.bedrooms} bed`}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}