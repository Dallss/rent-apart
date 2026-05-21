"use client";

import { useState } from "react";

const listings = [
  {
    id: 1,
    title: "Cebu IT Park Studio",
    address: "Lahug, Cebu City",
    type: "Studio",
    bedrooms: 0,
    bathrooms: 1,
    area: 28,
    price: 18000,
    minLease: 6,
    status: "occupied",
    tenant: "Maria Santos",
    leaseEnd: "2025-12-31",
  },
  {
    id: 2,
    title: "Ayala Condo Unit 12B",
    address: "Cebu Business Park, Cebu City",
    type: "1 Bedroom",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    price: 28000,
    minLease: 12,
    status: "available",
    tenant: null,
    leaseEnd: null,
  },
  {
    id: 3,
    title: "Banilad Family Home",
    address: "Banilad, Cebu City",
    type: "3 Bedroom House",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    price: 55000,
    minLease: 12,
    status: "occupied",
    tenant: "Dela Cruz Family",
    leaseEnd: "2026-03-01",
  },
  {
    id: 4,
    title: "Mandaue Townhouse",
    address: "A.S. Fortuna St., Mandaue City",
    type: "2 Bedroom",
    bedrooms: 2,
    bathrooms: 2,
    area: 75,
    price: 32000,
    minLease: 6,
    status: "expiring",
    tenant: "James Reyes",
    leaseEnd: "2025-07-15",
  },
  {
    id: 5,
    title: "Mactan Beachside Unit",
    address: "Lapu-Lapu City",
    type: "2 Bedroom",
    bedrooms: 2,
    bathrooms: 1,
    area: 58,
    price: 38000,
    minLease: 12,
    status: "maintenance",
    tenant: null,
    leaseEnd: null,
  },
];

const statusConfig = {
  occupied: {
    label: "Occupied",
    pill: "bg-emerald-100/80 text-emerald-800 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  available: {
    label: "Available",
    pill: "bg-blue-100/80 text-blue-800 border border-blue-200",
    dot: "bg-blue-500",
  },
  expiring: {
    label: "Expiring soon",
    pill: "bg-amber-100/80 text-amber-800 border border-amber-200",
    dot: "bg-amber-500",
  },
  maintenance: {
    label: "Maintenance",
    pill: "bg-rose-100/80 text-rose-800 border border-rose-200",
    dot: "bg-rose-500",
  },
};

const daysUntil = (d) =>
  d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

export default function HostListingsPage() {
  const [active, setActive] = useState<number | null>(null);

  const occupied = listings.filter(
    (l) => l.status === "occupied" || l.status === "expiring"
  ).length;

  const available = listings.filter(
    (l) => l.status === "available"
  ).length;

  const revenue = listings
    .filter((l) => l.status === "occupied" || l.status === "expiring")
    .reduce((s, l) => s + l.price, 0);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f3f4f6]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .row-hover {
          transition: all 0.2s ease;
        }

        .row-hover:hover {
          background: rgba(255,255,255,0.85);
          transform: translateY(-1px);
        }

        .fade-in {
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from {
            opacity:0;
            transform:translateY(8px);
          }
          to {
            opacity:1;
            transform:translateY(0);
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Your listings
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Long-term rentals · Cebu
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Occupied",
              value: occupied,
              sub: `of ${listings.length} units`,
              accent: "from-emerald-500/10 to-emerald-100",
            },
            {
              label: "Available",
              value: available,
              sub: "ready to lease",
              accent: "from-blue-500/10 to-blue-100",
            },
            {
              label: "Monthly income",
              value: `₱${(revenue / 1000).toFixed(0)}k`,
              sub: "from active leases",
              accent: "from-violet-500/10 to-violet-100",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`rounded-3xl border border-white/70 bg-gradient-to-br ${s.accent} backdrop-blur px-5 py-5 shadow-sm fade-in`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>

              <p className="text-sm font-semibold text-gray-700 mt-1">
                {s.label}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* LISTINGS */}
        <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur shadow-sm overflow-hidden divide-y divide-gray-100">
          {listings.map((l, i) => {
            const s = statusConfig[l.status];
            const days = daysUntil(l.leaseEnd);

            return (
              <div
                key={l.id}
                onClick={() =>
                  setActive(active === l.id ? null : l.id)
                }
                className="row-hover px-6 py-5 cursor-pointer fade-in"
                style={{ animationDelay: `${100 + i * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-5">

                  {/* LEFT */}
                  <div className="flex items-center gap-4 min-w-0">

                    {/* PROPERTY ICON */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 flex items-center justify-center text-gray-500 shadow-inner">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-7 h-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"
                        />
                      </svg>
                    </div>

                    {/* INFO */}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-[15px] truncate">
                        {l.title}
                      </p>

                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {l.address}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {l.type} · {l.area} m² · min. {l.minLease} mo
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-2 shrink-0">

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.pill}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                      />
                      {s.label}
                    </span>

                    <p className="text-lg font-bold tracking-tight text-gray-900">
                      ₱{l.price.toLocaleString()}
                      <span className="text-xs font-medium text-gray-400 ml-0.5">
                        /mo
                      </span>
                    </p>
                  </div>
                </div>

                {/* EXPANDED */}
                {active === l.id && (
                  <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between text-sm fade-in">

                    <div>
                      {l.tenant ? (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                            Tenant
                          </p>

                          <p className="font-semibold text-gray-800">
                            {l.tenant}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No current tenant
                        </p>
                      )}
                    </div>

                    {l.leaseEnd && (
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                          Lease ends
                        </p>

                        <p
                          className={`font-semibold ${
                            days !== null && days < 60
                              ? "text-amber-600"
                              : "text-gray-800"
                          }`}
                        >
                          {new Date(l.leaseEnd).toLocaleDateString(
                            "en-PH",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}

                          {days !== null &&
                            days > 0 &&
                            days < 90 && (
                              <span className="text-xs text-amber-500 ml-1">
                                ({days}d left)
                              </span>
                            )}
                        </p>
                      </div>
                    )}

                    <button className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                      View details →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ADD BUTTON */}
        <button className="mt-5 w-full py-4 rounded-3xl border border-dashed border-gray-300 bg-white/70 backdrop-blur text-sm font-semibold text-gray-500 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50/50 transition-all">
          + Add a listing
        </button>
      </div>
    </div>
  );
}