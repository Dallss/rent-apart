// app/listings/[id]/page.tsx

import { notFound } from "next/navigation";
import ListingImages from "./components/ListingImages";
import Link from "next/link";
import { iconMap, DefaultAmenityIcon } from "@/lib/icons";

import { Suspense } from "react";
import ListingImagesLoading from "./components/ListingImagesLoading";

import Footer from "@/app/components/Footer";

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
      <main className="bg-white text-foreground flex flex-col items-center py-10 pb-0">
         <div className="w-full max-w-6xl pb-10 px-6 min-h-screen">
            {/* HEADER */}
            <section className="mb-6">
               <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                  {listing.title}
               </h1>

               <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-muted">
                  <span className="underline cursor-pointer">
                     {listing.city}
                  </span>
               </div>
            </section>

            {/* IMAGES */}
            <section className="overflow-hidden rounded-3xl mb-10">
               <Suspense fallback={<ListingImagesLoading />}>
                  <ListingImages images={listing.images} />
               </Suspense>
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
                              {listing.listing_type || "Entire rental unit"} in{" "}
                              {listing.city}
                           </h2>
                           <p className="text-muted mt-2">
                              {listing.bedrooms} bedroom
                              {listing.bedrooms !== 1 ? "s" : ""} ·{" "}
                              {listing.bathrooms} bath
                              {listing.bathrooms !== 1 ? "s" : ""}
                           </p>
                        </div>
                     </div>
                  </section>

                  {/* FEATURES */}
                  {/*<section className="space-y-6 pb-8 border-b border-border">
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
            </section>*/}

                  {/* DESCRIPTION */}
                  <section className="pb-8 border-b border-border">
                     <h2 className="text-xl font-semibold mb-4">
                        About this place
                     </h2>
                     <p className="text-muted leading-7 max-w-3xl">
                        {listing.description}
                     </p>
                  </section>

                  {/* AMENITIES */}
                  {listing.amenities?.length > 0 && (
                     <section className="pt-2 pb-8">
                        <h2 className="text-xl font-semibold mb-6">
                           What this place offers
                        </h2>

                        <div className="flex flex-wrap gap-3">
                           {listing.amenities.map((amenity) => {
                              const Icon =
                                 iconMap[
                                    amenity.icon as keyof typeof iconMap
                                 ] ?? DefaultAmenityIcon;

                              return (
                                 <div
                                    key={amenity.id}
                                    className="
                          inline-flex items-center gap-2
                          px-4 py-2.5
                          rounded-full
                          bg-orange-50
                          border border-orange-100
                          text-black
                          shadow-sm
                          transition-all duration-200
                          hover:bg-orange-100
                        "
                                 >
                                    <Icon
                                       size={16}
                                       className="text-orange-600 shrink-0"
                                    />

                                    <span className="text-sm font-medium">
                                       {amenity.name}
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </section>
                  )}
               </div>

               {/* RIGHT COLUMN */}
               <aside className="">
                  <div className="border border-border rounded-3xl p-6 shadow-lg bg-card">
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

            {/* RATINGS & REVIEWS (HARDCODED FOR NOW) */}
            <section className="border-t border-border pt-8">
               <h2 className="text-xl font-semibold mb-6">
                  Reviews{" "}
                  <span className="text-xs font-normal text-zinc-400">
                     (dev note: This part is still hardcoded)
                  </span>
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-border p-5">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold">
                           M
                        </div>

                        <div>
                           <p className="font-medium">Maria Santos</p>
                           <p className="text-sm text-muted">
                              Stayed 3 months · March 2026
                           </p>
                        </div>
                     </div>

                     <p className="text-muted leading-7">
                        The villa exceeded expectations. The location was quiet,
                        the pool was always clean, and the sea view was
                        incredible every morning.
                     </p>
                  </div>

                  <div className="rounded-2xl border border-border p-5">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold">
                           J
                        </div>

                        <div>
                           <p className="font-medium">James Reyes</p>
                           <p className="text-sm text-muted">
                              Stayed 1 month · January 2026
                           </p>
                        </div>
                     </div>

                     <p className="text-muted leading-7">
                        Fast WiFi, spacious rooms, and responsive landlord.
                        Perfect for remote work while staying near the beach.
                     </p>
                  </div>

                  <div className="rounded-2xl border border-border p-5">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold">
                           A
                        </div>

                        <div>
                           <p className="font-medium">Anna Cruz</p>
                           <p className="text-sm text-muted">
                              Stayed 6 months · August 2025
                           </p>
                        </div>
                     </div>

                     <p className="text-muted leading-7">
                        Security and amenities were excellent. The furnished
                        interior made moving in incredibly easy.
                     </p>
                  </div>

                  <div className="rounded-2xl border border-border p-5">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold">
                           D
                        </div>

                        <div>
                           <p className="font-medium">Daniel Lim</p>
                           <p className="text-sm text-muted">
                              Stayed 2 months · November 2025
                           </p>
                        </div>
                     </div>

                     <p className="text-muted leading-7">
                        One of the best rental experiences I've had. Great
                        neighborhood, clean property, and amazing beachfront
                        view.
                     </p>
                  </div>
               </div>
            </section>
         </div>

         <Footer />
      </main>
   );
}
