"use client";
import ListingCollection from "@/app/components/ListingCollection";
import useRuntimeConfig from "@/hooks/useRuntimeConfig";
import Image from "next/image";
import Link from "next/link";


function NeighborhoodCard({
  title,
  image,
  href,
}: {
  title: string;
  image: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex-1 h-28 rounded-xl overflow-hidden relative flex items-center justify-center text-center shadow-sm hover:shadow-md transition"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative text-white font-semibold text-lg">
        {title}
      </div>
    </Link>
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
              href="/listings?place=Cebu+City%2C+Cebu%2C+Philippines&city_google_place_id=ChIJ_S3NjSWZqTMRBzXT2wwDNEw"
            />

            <NeighborhoodCard
              title="Mandaue"
              image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"
              href="/listings?place=Mandaue+City%2C+Cebu%2C+Philippines&city_google_place_id=ChIJ_e4MaImYqTMRcqXd9aER-ak"
            />

            <NeighborhoodCard
              title="Lapu-Lapu"
              image="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop"
              href="/listings?place=Lapu-lapu+City%2C+Cebu%2C+Philippines&city_google_place_id=ChIJG8Rz2f6ZqTMRLC6gsQOv6Ro"
            />

            <NeighborhoodCard
              title="Talisay"
              image="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop"
              href="/listings?place=Talisay%2C+Cebu%2C+Philippines&city_google_place_id=ChIJ7TrL8K2dqTMRAGpBmHrrZIQ"
            />

            <NeighborhoodCard
              title="Consolacion"
              image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop"
              href="/listings?place=Consolacion%2C+Cebu%2C+Philippines&city_google_place_id=ChIJbQWNkryiqTMRiriPoPQqerk"
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