"use client";
import ListingCollection from "./ListingCollection"
import useRuntimeConfig from "@/hooks/useRuntimeConfig";

export default function Listings() {
  const { config } = useRuntimeConfig();

  return (
    <div className="flex min-h-full flex-col w-full max-w-screen-2xl mx-auto">

      <main className="mx-auto w-full max-w-screen flex-1 px-4 py-8 border">
        { config && (
          <ListingCollection
            title="Apartments"
            api={`${config.apiUrl}/api/listings/`}
          />
        )}
      </main>
    </div>
  );
}