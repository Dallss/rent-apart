// app/listings/[id]/page.tsx

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Footer from "@/app/components/Footer";
import ListingContent from "./components/ListingContent";

// ── Types ──────────────────────────────────────────────────

export interface ListingImage {
   id: number;
   image_url: string;
   caption: string;
}

export interface Listing {
   id: number;
   title: string;
   description: string;
   landlord: string;
   is_unfinished: boolean;
   country: string;
   city: string;
   neighborhood: string;
   street_address: string;
   latitude: string;
   longitude: string;
   monthly_rent: string;
   bedrooms: number;
   bathrooms: number;
   is_available: boolean;
   listing_type: string;
   property_type: string;
   hero_image: string;
   images: ListingImage[];
   amenities: { id: number; name: string; icon: string }[];
   created_at: string;
   updated_at: string;
}

// ── Data fetching ──────────────────────────────────────────

const AUTH_COOKIE_NAMES = [
   "sessionid",
   "csrftoken",
   "access_token",
   "refresh_token",
   "auth",
];

async function getListing(id: string): Promise<Listing> {
   if (!process.env.BACKEND_API_URL)
      throw new Error("BACKEND_API_URL is not defined");

   const url = `${process.env.BACKEND_API_URL}/api/listings/${id}/`;
   console.log("FETCHING:", url);

   const res = await fetch(url, { cache: "no-store" });
   if (res.status === 404) return notFound();
   if (!res.ok) throw new Error(`Failed to fetch listing: ${res.status}`);
   return res.json();
}

/**
 * Checks ownership by hitting /api/listings/?mine=true with the user's
 * cookies and seeing if this listing's id appears in the results.
 * This is reliable regardless of how the backend serialises the landlord field.
 */
async function getIsOwner(listingId: string): Promise<boolean> {
   if (!process.env.BACKEND_API_URL) return false;

   const store = await cookies();
   const cookieHeader = AUTH_COOKIE_NAMES.map((name) => {
      const v = store.get(name)?.value;
      return v ? `${name}=${v}` : null;
   })
      .filter(Boolean)
      .join("; ");

   if (!cookieHeader) return false;

   try {
      const res = await fetch(
         `${process.env.BACKEND_API_URL}/api/listings/?mine=true`,
         {
            headers: { Cookie: cookieHeader, Accept: "application/json" },
            cache: "no-store",
         },
      );
      if (!res.ok) return false;
      const data = await res.json();
      const listings: { id: number }[] = Array.isArray(data)
         ? data
         : (data.results ?? []);
      return listings.some((l) => String(l.id) === listingId);
   } catch {
      return false;
   }
}

// ── Page ──────────────────────────────────────────────────

export default async function ListingDetailPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = await params;
   const [listing, isOwner] = await Promise.all([
      getListing(id),
      getIsOwner(id),
   ]);

   return (
      <main className="bg-white text-foreground flex flex-col items-center py-10 pb-0">
         <div className="w-full max-w-6xl pb-10 px-6 min-h-screen">
            <ListingContent listing={listing} isOwner={isOwner} />
         </div>
         <Footer />
      </main>
   );
}
