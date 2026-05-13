"use client";

import { AuthToolbar } from "@/components/auth-toolbar";

type Listing = {
  id: string;
  title: string;
  neighborhood: string;
  rent: number;
  bedrooms: number;
  sqft: number;
  blurb: string;
};

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Sunny 2BR near the park",
    neighborhood: "Northside",
    rent: 2450,
    bedrooms: 2,
    sqft: 920,
    blurb: "Corner unit, in-unit laundry, pet-friendly building.",
  },
  {
    id: "2",
    title: "Studio with skyline view",
    neighborhood: "Downtown",
    rent: 1895,
    bedrooms: 0,
    sqft: 480,
    blurb: "Floor-to-ceiling windows, gym in building.",
  },
  {
    id: "3",
    title: "Quiet 1BR garden level",
    neighborhood: "West End",
    rent: 1650,
    bedrooms: 1,
    sqft: 640,
    blurb: "Private patio, street parking available.",
  },
];

function formatRent(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AuthToolbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Browse apartments
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Landlords list units here; renters explore availability. Sample listings below —
            wire your Django API when endpoints are ready.
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_LISTINGS.map((item) => (
            <li key={item.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
                <div className="aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800" />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {item.neighborhood}
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.blurb}</p>
                  <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <div>
                      <dt className="sr-only">Rent</dt>
                      <dd className="font-semibold text-foreground">{formatRent(item.rent)}</dd>
                      <span className="text-zinc-500"> / mo</span>
                    </div>
                    <div>
                      <dt className="sr-only">Bedrooms</dt>
                      <dd>{item.bedrooms === 0 ? "Studio" : `${item.bedrooms} bed`}</dd>
                    </div>
                    <div>
                      <dt className="sr-only">Size</dt>
                      <dd>{item.sqft} sq ft</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
