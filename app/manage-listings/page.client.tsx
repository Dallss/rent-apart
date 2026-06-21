"use client";

import { useState } from "react";

type EventType = "remittance" | "concern" | "utility";

interface CalendarEvent {
  id: number;
  date: string;
  type: EventType;
  title: string;
  listingId: number;
  note?: string;
}

const listings = [
  { id: 1, title: "Cebu IT Park Studio", address: "Lahug, Cebu City", type: "Studio", bedrooms: 0, bathrooms: 1, area: 28, price: 18000, minLease: 6, status: "occupied", tenant: "Maria Santos", leaseEnd: "2025-12-31" },
  { id: 2, title: "Ayala Condo Unit 12B", address: "Cebu Business Park, Cebu City", type: "1 Bedroom", bedrooms: 1, bathrooms: 1, area: 45, price: 28000, minLease: 12, status: "available", tenant: null, leaseEnd: null },
  { id: 3, title: "Banilad Family Home", address: "Banilad, Cebu City", type: "3 Bedroom House", bedrooms: 3, bathrooms: 2, area: 120, price: 55000, minLease: 12, status: "occupied", tenant: "Dela Cruz Family", leaseEnd: "2026-03-01" },
  { id: 4, title: "Mandaue Townhouse", address: "A.S. Fortuna St., Mandaue City", type: "2 Bedroom", bedrooms: 2, bathrooms: 2, area: 75, price: 32000, minLease: 6, status: "expiring", tenant: "James Reyes", leaseEnd: "2025-07-15" },
  { id: 5, title: "Mactan Beachside Unit", address: "Lapu-Lapu City", type: "2 Bedroom", bedrooms: 2, bathrooms: 1, area: 58, price: 38000, minLease: 12, status: "maintenance", tenant: null, leaseEnd: null },
];

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth() + 1;
const pad = (n: number) => String(n).padStart(2, "0");

const initialEvents: CalendarEvent[] = [
  { id: 1, date: `${y}-${pad(m)}-05`, type: "remittance", title: "Rent – Maria Santos", listingId: 1, note: "₱18,000 due" },
  { id: 2, date: `${y}-${pad(m)}-05`, type: "remittance", title: "Rent – Dela Cruz Family", listingId: 3, note: "₱55,000 due" },
  { id: 3, date: `${y}-${pad(m)}-05`, type: "remittance", title: "Rent – James Reyes", listingId: 4, note: "₱32,000 due" },
  { id: 4, date: `${y}-${pad(m)}-10`, type: "utility", title: "Meralco bill – Studio", listingId: 1, note: "Electricity" },
  { id: 5, date: `${y}-${pad(m)}-12`, type: "concern", title: "AC repair request", listingId: 3, note: "Dela Cruz Family" },
  { id: 6, date: `${y}-${pad(m)}-15`, type: "utility", title: "Water bill – Mandaue", listingId: 4, note: "MCWD" },
  { id: 7, date: `${y}-${pad(m)}-18`, type: "concern", title: "Roof leak inspection", listingId: 4 },
  { id: 8, date: `${y}-${pad(m)}-20`, type: "utility", title: "Internet renewal – Ayala", listingId: 2, note: "PLDT" },
  { id: 9, date: `${y}-${pad(m)}-25`, type: "remittance", title: "Deposit refund check", listingId: 5 },
  { id: 10, date: `${y}-${pad(m)}-28`, type: "concern", title: "Plumbing check", listingId: 1, note: "Tenant request" },
];

const statusConfig = {
  occupied: { label: "Occupied", pill: "bg-gray-100 text-gray-700 border border-gray-200", dot: "bg-emerald-500" },
  available: { label: "Available", pill: "bg-gray-100 text-gray-700 border border-gray-200", dot: "bg-blue-400" },
  expiring: { label: "Expiring soon", pill: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
  maintenance: { label: "Maintenance", pill: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-400" },
};

const eventConfig: Record<EventType, { label: string; dot: string; tag: string }> = {
  remittance: { label: "Remittance", dot: "bg-emerald-500", tag: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  concern: { label: "Concern", dot: "bg-amber-400", tag: "bg-amber-50 text-amber-700 border-amber-200" },
  utility: { label: "Utility", dot: "bg-blue-400", tag: "bg-blue-50 text-blue-700 border-blue-200" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const daysUntil = (d: string | null) =>
  d ? Math.ceil((new Date(d).getTime() - new Date().getTime()) / 86400000) : null;

function AddEventModal({
  selectedDate,
  onClose,
  onAdd,
}: {
  selectedDate: string;
  onClose: () => void;
  onAdd: (e: CalendarEvent) => void;
}) {
  const [type, setType] = useState<EventType>("remittance");
  const [title, setTitle] = useState("");
  const [listingId, setListingId] = useState(listings[0].id);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      id: Date.now(),
      date: selectedDate,
      type,
      title: title.trim(),
      listingId,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-sm">Add event</h3>
          <span className="text-xs text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>{selectedDate}</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            {(["remittance", "concern", "utility"] as EventType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                  type === t
                    ? `${eventConfig[t].tag} border`
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {eventConfig[t].label}
              </button>
            ))}
          </div>

          <input
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
            value={listingId}
            onChange={(e) => setListingId(Number(e.target.value))}
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>

          <input
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function Calendar({
  events,
  onAddEvent,
}: {
  events: CalendarEvent[];
  onAddEvent: (date: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );

  const monthKey = `${viewYear}-${pad(viewMonth + 1)}`;

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  events
    .filter((e) => e.date.startsWith(monthKey))
    .forEach((e) => {
      const d = parseInt(e.date.split("-")[2]);
      if (!eventsByDay[d]) eventsByDay[d] = [];
      eventsByDay[d].push(e);
    });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((value) => value - 1);
    } else {
      setViewMonth((value) => value - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((value) => value + 1);
    } else {
      setViewMonth((value) => value + 1);
    }
    setSelectedDay(null);
  };

  const selectedDateStr = selectedDay
    ? `${viewYear}-${pad(viewMonth + 1)}-${pad(selectedDay)}`
    : null;

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

  const isToday = (d: number) =>
    d === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none">‹</button>
        <p className="text-sm font-semibold text-gray-900">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none">›</button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="h-10 border-b border-r border-gray-50 last:border-r-0" />;
          }

          const dayEvents = eventsByDay[day] ?? [];
          const selected = selectedDay === day;
          const types = [...new Set(dayEvents.map((e) => e.type))];

          return (
            <div
              key={day}
              onClick={() => setSelectedDay(selected ? null : day)}
              className={`h-10 flex flex-col items-center justify-center cursor-pointer border-b border-r border-gray-50 last:border-r-0 relative transition-colors ${
                selected ? "bg-gray-900" : isToday(day) ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <span className={`text-xs font-medium ${selected ? "text-white" : isToday(day) ? "text-gray-900" : "text-gray-700"}`}>
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {types.slice(0, 3).map((t) => (
                    <span key={t} className={`w-1 h-1 rounded-full ${eventConfig[t].dot} ${selected ? "opacity-80" : ""}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {MONTHS[viewMonth]} {selectedDay}
            </p>
            {selectedDateStr && (
              <button
                onClick={() => onAddEvent(selectedDateStr)}
                className="text-xs font-medium text-gray-700 hover:text-gray-900"
              >
                + Add event
              </button>
            )}
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events for this date.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-gray-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${eventConfig[event.type].dot}`} />
                    <span className="text-sm font-medium text-gray-900">{event.title}</span>
                  </div>
                  {event.note && <p className="mt-1 text-xs text-gray-500">{event.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManageListingsClientPage() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                Host dashboard
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">Manage listings</h1>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => {
              const days = daysUntil(listing.leaseEnd);
              const status = statusConfig[listing.status as keyof typeof statusConfig];

              return (
                <article key={listing.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.pill}`}>
                      {status.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">₱{listing.price.toLocaleString()}</span>
                  </div>

                  <h2 className="text-base font-semibold text-gray-900">{listing.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{listing.address}</p>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>{listing.type} · {listing.bedrooms} bed · {listing.bathrooms} bath</p>
                    <p>{listing.area} sqm · min {listing.minLease} months</p>
                    <p>{listing.tenant ? `Tenant: ${listing.tenant}` : "No active tenant"}</p>
                    {days !== null && <p>Lease ends in {days} day{days === 1 ? "" : "s"}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <Calendar events={events} onAddEvent={setSelectedDate} />
        </section>
      </div>

      {selectedDate && (
        <AddEventModal
          selectedDate={selectedDate}
          onClose={() => setSelectedDate(null)}
          onAdd={(event) => setEvents((prev) => [...prev, event])}
        />
      )}
    </main>
  );
}
