// app/listings/[id]/page.tsx

import { notFound } from "next/navigation";
import ListingImages from "./components/ListingImages";
import Link from "next/link";

interface ListingImage {
  id: number;
  image_url: string;
  caption: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  landlord: string;
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
  amenities: {
    id: number;
    name: string;
    icon: string;
  }[];
  created_at: string;
  updated_at: string;
}

async function getListing(id: string): Promise<Listing> {
  if (!process.env.BACKEND_API_URL) {
    throw new Error("BACKEND_API_URL is not defined");
  }

  const url = `${process.env.BACKEND_API_URL}/api/listings/${id}/`;

  console.log("FETCHING:", url);

  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error(`Failed to fetch listing: ${res.status}`);

  return res.json();
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);

  const monthlyRent = parseFloat(listing.monthly_rent);

  return (
    <main className="min-h-screen bg-white text-foreground flex justify-center px-6 py-10">
      <div className="w-full max-w-6xl">

        {/* HEADER */}
        <section className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            {listing.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-muted">
            <span className="underline cursor-pointer">{listing.city}</span>
          </div>
        </section>

        {/* IMAGES */}
        <section className="overflow-hidden rounded-3xl mb-10">
          <ListingImages images={listing.images} />
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">

          {/* LEFT COLUMN */}
          <div className="space-y-10">

            {/* HOST */}
            <section className="pb-8 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold leading-snug">
                    {listing.listing_type || "Entire rental unit"} in {listing.city}
                  </h2>
                  <p className="text-muted mt-2">
                    {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""} ·{" "}
                    {listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </section>

            {/* FEATURES */}
            <section className="space-y-6 pb-8 border-b border-border">
              <div className="flex gap-4 items-start">
                <div className="text-xl">🏡</div>
                <div>
                  <h3 className="font-medium">Entire home</h3>
                  <p className="text-sm text-muted">
                    You'll have the apartment to yourself.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-xl">📍</div>
                <div>
                  <h3 className="font-medium">Great location</h3>
                  <p className="text-sm text-muted">{listing.street_address}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-xl">🔑</div>
                <div>
                  <h3 className="font-medium">Self check-in</h3>
                  <p className="text-sm text-muted">
                    Check yourself in with the smart lock.
                  </p>
                </div>
              </div>
            </section>

            {/* DESCRIPTION */}
            <section className="pb-8 border-b border-border">
              <h2 className="text-xl font-semibold mb-4">About this place</h2>
              <p className="text-muted leading-7 max-w-3xl">{listing.description}</p>
            </section>

            {/* AMENITIES */}
            {listing.amenities?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-5">
                  What this place offers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-muted">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <span>{amenity.icon}</span>
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <aside>
            <div className="sticky top-[200px] border border-border rounded-3xl p-6 shadow-lg bg-card">

              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-semibold">
                  ₱{monthlyRent.toLocaleString()}
                </span>
                <span className="text-muted mb-1">/ month</span>
              </div>

              <Link
                href="/schedule-tour"
                className="block text-center w-full bg-accent hover:primary-ligt transition-colors text-white font-medium py-3 rounded-2xl"
              >
                Schedule a Tour
              </Link>

              <p className="text-center text-xs text-muted mt-3">
                Monthly breakdown
              </p>

              {/* PRICE BREAKDOWN */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span className="underline">Monthly rent</span>
                  <span>₱{monthlyRent.toLocaleString()}</span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total monthly payment</span>
                  <span>₱{monthlyRent.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}