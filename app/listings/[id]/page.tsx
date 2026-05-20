// app/page.tsx

import Images from "@/components/listing-view/images";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex justify-center px-6 py-10">
      <div className="w-full max-w-6xl">

        {/* HEADER */}
        <section className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            Salinas Drive · 3 Bedroom Apartment
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-muted">
            <span className="flex items-center gap-1">
              ⭐ 4.92
              <span>·</span>
              <span className="underline cursor-pointer">128 reviews</span>
            </span>

            <span>·</span>

            <span className="underline cursor-pointer">
              Cebu City, Philippines
            </span>
          </div>
        </section>

        {/* IMAGES */}
        <section className="overflow-hidden rounded-3xl mb-10">
          <Images />
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
                    Entire rental unit hosted by Randall
                  </h2>

                  <p className="text-muted mt-2">
                    6 guests · 3 bedrooms · 4 beds · 2 baths
                  </p>
                </div>

                <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center font-semibold">
                  R
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
                    You’ll have the apartment to yourself.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-xl">📍</div>
                <div>
                  <h3 className="font-medium">Great location</h3>
                  <p className="text-sm text-muted">
                    Near IT Park, restaurants, and cafes.
                  </p>
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
              <h2 className="text-xl font-semibold mb-4">
                About this place
              </h2>

              <p className="text-muted leading-7 max-w-3xl">
                Modern and spacious apartment located in the heart of Cebu City.
                Designed with a clean minimalist style, this space is perfect for
                families, remote workers, or groups looking for comfort and convenience.
              </p>
            </section>

            {/* AMENITIES */}
            <section>
              <h2 className="text-xl font-semibold mb-5">
                What this place offers
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-muted">
                <div>📶 Wifi</div>
                <div>❄️ Air conditioning</div>
                <div>🍳 Kitchen</div>
                <div>🚗 Free parking</div>
                <div>🧺 Washer</div>
                <div>📺 TV</div>
                <div>🏊 Pool access</div>
                <div>🏋️ Gym</div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN */}
          <aside>
            <div className="sticky top-10 border border-border rounded-3xl p-6 shadow-lg bg-card">

              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-semibold">₱4,500</span>
                <span className="text-muted mb-1">night</span>
              </div>

              {/* DATE BOX */}
              <div className="border border-border rounded-2xl overflow-hidden mb-4 text-sm bg-background">

                <div className="grid grid-cols-2 divide-x divide-border">

                  <div className="p-3">
                    <p className="text-[10px] uppercase font-bold text-muted">
                      Check-in
                    </p>
                    <p className="text-muted">Add date</p>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] uppercase font-bold text-muted">
                      Checkout
                    </p>
                    <p className="text-muted">Add date</p>
                  </div>

                </div>

                <div className="p-3 border-t border-border">
                  <p className="text-[10px] uppercase font-bold text-muted">
                    Guests
                  </p>
                  <p className="text-muted">1 guest</p>
                </div>

              </div>

              <button className="w-full bg-rose-500 hover:bg-rose-600 transition-colors text-white font-medium py-3 rounded-2xl">
                Reserve
              </button>

              <p className="text-center text-xs text-muted mt-3">
                You won’t be charged yet
              </p>

              {/* PRICE BREAKDOWN */}
              <div className="mt-6 space-y-3 text-sm">

                <div className="flex justify-between text-muted">
                  <span className="underline">₱4,500 × 5 nights</span>
                  <span>₱22,500</span>
                </div>

                <div className="flex justify-between text-muted">
                  <span className="underline">Cleaning fee</span>
                  <span>₱1,200</span>
                </div>

                <div className="flex justify-between text-muted">
                  <span className="underline">Service fee</span>
                  <span>₱1,100</span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₱24,800</span>
                </div>

              </div>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}