"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useQueries } from "@tanstack/react-query";
import { fetchApi } from "@/lib/auth";
import Link from "next/link";
import { Heart } from "lucide-react";
import ListingCard from "@/app/components/ListingCard";
import Footer from "@/app/components/Footer";

type ListingDetail = {
   id: number;
   title: string;
   city: string;
   monthly_rent: string;
   bedrooms: number;
   hero_image: string;
   rating?: number | null;
};

export default function LikedListingsClientPage() {
   const { ready, isSignedIn, likedListings, setShowAuthModal } = useAuth();

   const queries = useQueries({
      queries: likedListings.map((id) => ({
         queryKey: ["listing-detail", id] as const,
         queryFn: async (): Promise<ListingDetail> => {
            const res = await fetchApi(`/api/listings/${id}/`);
            if (!res.ok) throw new Error(`Failed to fetch listing ${id}`);
            return res.json();
         },
         enabled: isSignedIn && likedListings.length > 0,
         staleTime: 5 * 60 * 1000,
      })),
   });

   const listings = queries
      .filter(
         (q): q is typeof q & { data: ListingDetail } =>
            q.status === "success" && q.data != null,
      )
      .map((q) => ({
         id: String(q.data.id),
         title: q.data.title,
         neighborhood: q.data.city,
         rent: parseFloat(q.data.monthly_rent),
         bedrooms: q.data.bedrooms,
         hero_image: q.data.hero_image,
         rating: q.data.rating != null ? String(q.data.rating) : null,
         blurb: "",
      }));

   const isLoading = !ready || queries.some((q) => q.isLoading);

   // Prompt unauthenticated users to sign in
   if (ready && !isSignedIn) {
      return (
         <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F1F5F9]">
            <Heart className="h-12 w-12 text-zinc-300" />
            <p className="text-lg font-medium text-zinc-700">
               Sign in to see your saved listings
            </p>
            <button
               onClick={() => setShowAuthModal(true)}
               className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white"
            >
               Sign in
            </button>
         </main>
      );
   }

   return (
      <main className="min-h-screen bg-[#F1F5F9]">
         <div className="mx-auto max-w-screen-xl px-6 py-10">
            <div className="mb-8 flex items-center gap-3">
               <Heart className="h-6 w-6 fill-red-500 text-red-500" />
               <h1 className="text-2xl font-semibold text-gray-900">
                  Saved listings
               </h1>
            </div>

            {isLoading && (
               <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                     <div
                        key={i}
                        className="h-64 rounded-xl bg-zinc-200 animate-pulse"
                     />
                  ))}
               </div>
            )}

            {!isLoading && likedListings.length === 0 && (
               <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Heart className="mb-4 h-12 w-12 text-zinc-300" />
                  <p className="text-base font-medium text-zinc-600">
                     No saved listings yet
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                     Tap the heart on any listing to save it here.
                  </p>
                  <Link
                     href="/"
                     className="mt-6 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                     Browse listings
                  </Link>
               </div>
            )}

            {!isLoading && listings.length > 0 && (
               <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {listings.map((item) => (
                     <li key={item.id}>
                        <Link href={`/listings/${item.id}`}>
                           <ListingCard item={item} />
                        </Link>
                     </li>
                  ))}
               </ul>
            )}
         </div>
         <Footer />
      </main>
   );
}
