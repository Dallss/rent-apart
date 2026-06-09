"use client";
import ListingCollection from "@/app/(components)/ListingCollection";
import useRuntimeConfig from "@/hooks/useRuntimeConfig";
import Image from "next/image";

function NeighborhoodCard({
  title,
  image,
}: {
  title: string;
  image: string;
}) {
  return (
    <div className="flex-1 h-28 rounded-xl overflow-hidden relative flex items-center justify-center text-center shadow-sm hover:shadow-md transition">
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative text-white font-semibold text-l">
        {title}
      </div>
    </div>
  );
}

export default function Listings() {
  const { config } = useRuntimeConfig();

  return (
    <div className="flex min-h-full flex-col w-full max-w-screen-2xl mx-auto">
      <main className="mx-auto w-full flex-1 px-4 py-8 border">

        {config && (
          <ListingCollection
            title="Featured"
            api={`${config.apiUrl}/api/listings/`}
          />
        )}

        <div className="ml-3 mt-8">
          <h2 className="text-xl font-thin tracking-wide">
            Neighborhood
          </h2>

          <div className="flex gap-4 w-full mt-4 p-5">
            <NeighborhoodCard
              title="Metro Cebu"
              image="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop"
            />

            <NeighborhoodCard
              title="Mandaue"
              image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"
            />

            <NeighborhoodCard
              title="Lapu-lapu"
              image="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop"
            />

            <NeighborhoodCard
              title="Talisay"
              image="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop"
            />

            <NeighborhoodCard
              title="Consolacion"
              image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop"
            />
          </div>
        </div>

        {config && (
          <ListingCollection
            title="Apartments"
            api={`${config.apiUrl}/api/listings/`}
          />
        )}

      </main>
    </div>
  );
}