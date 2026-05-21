"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import Listing from "./listing";

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
          image: item.hero_image,
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
    <div className="flex min-h-full flex-col w-screen">
      <main className="mx-auto w-full max-w-screen flex-1 px-4 py-8">
        <div className="ml-3">
          <h1 className="font-semibold tracking-tight sm:text-2xl">
            Popular apartments
          </h1>
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
          <ul className="flex w-full gap-4 overflow-x-auto overflow-y-hidden mb-5">
          {listings.map((item) => (
            <li key={item.id}>
              <Link href={`/listings/${item.id}`}>
                <Listing item={item} />
              </Link>
            </li>
          ))}
        </ul>
        )}

        <div className="ml-3">
          <h1 className="font-semibold tracking-tight sm:text-2xl">
            Apartments
          </h1>
        </div>

        {/* Listings */}
        {!loading && !error && (
          <ul className="flex w-full gap-4 overflow-x-auto overflow-y-hidden mb-5">
          {listings.map((item) => (
            <li key={item.id}>
              <Link href={`/listings/${item.id}`}>
                <Listing item={item} />
              </Link>
            </li>
          ))}
        </ul>
        )}
      </main>
    </div>
  );
}