"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import Listing from "./Listing";

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

export function ListingSection() {
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

        
        //   "id": 10,
        //   "hero": {
        //     "title": "Heritage Loft Near Colon Street — Fully Renovated",
        //     "image": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&h=800&q=80",
        //     "price": 16000,
        //     "city": "Cebu City"
        //   },
        //   "listing_type": "",
        //   "property_type": ""
        
        const data: ApiListing[] = await res.json();

        const mapped: Listing[] = data.map((item) => ({
          id: String(item.id),
          title: item.hero.title,
          neighborhood: item.hero.city, // or address if you prefer
          rent: Number(item.hero.price),
          bedrooms: item.bedrooms,
          image: item.hero.image,
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
    <div className="flex min-h-full flex-col w-full max-w-screen-2xl mx-auto">
      <main className="mx-auto w-full max-w-screen flex-1 px-4 py-8">
        <div className="ml-3">
          <h1 className="font-sans font-light tracking-wide sm:text-2xl">
          Apartments Near University of the Philippines - Cebu
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
          <ul className="flex w-full overflow-x-auto overflow-y-hidden mb-10">
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
          <h1 className=" font-sans font-light tracking-wid sm:text-2xl">
          Popular apartments
          </h1>
        </div>
        {/* Listings */}
        {!loading && !error && (
          <ul className="flex w-full overflow-x-auto overflow-y-hidden mb-10">
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
          <h1 className=" font-sans font-light tracking-wid sm:text-2xl">
          Budget Friendly Apartments
          </h1>
        </div>
        {/* Listings */}
        {!loading && !error && (
          <ul className="flex w-full overflow-x-auto overflow-y-hidden mb-10">
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
          <h1 className=" font-sans font-light tracking-wid sm:text-2xl">
          Perfect for Students Apartments
          </h1>
        </div>
        {/* Listings */}
        {!loading && !error && (
          <ul className="flex w-full overflow-x-auto overflow-y-hidden mb-10">
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