"use client";
import { useEffect, useState } from "react";
import ListingLoading from "./ListingLoading";
import ListingCollection from "./ListingCollection"
import ListingError from "./ListingError";
import useRuntimeConfig from "@/hooks/useRuntimeConfig";

type ApiListing = {
  id: number;
  hero: {
    title: string;
    image: string;
    price: number;
    city: string;
  };
  description: string;
  address: string;
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

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { config } = useRuntimeConfig();

  useEffect(() => {
    if(!config) return;
    async function loadListings() {
      try {
        setLoading(true);

        // 2. use runtime API URL
        const res = await fetch(`${config.apiUrl}/api/listings/`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch listings");
        }
        
        const response = await res.json();
        const data = response.results as ApiListing[];
        
        const mapped: Listing[] = data.map((item) => ({
          id: String(item.id),
          title: item.hero.title,
          neighborhood: item.hero.city,
          rent: Number(item.hero.price),
          bedrooms: item.bedrooms,
          sqft: 0,
          blurb: item.description ?? "",
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
  }, [config]);

  return (
    <div className="flex min-h-full flex-col w-full max-w-screen-2xl mx-auto">
      <main className="mx-auto w-full max-w-screen flex-1 px-4 py-8 border">
        

        { config && (
          <ListingCollection
            title="Apartments Near University of the Philippines - Cebu"
            api={`${config.apiUrl}/api/listings/`}
          />
        )}


      </main>
    </div>
  );
}