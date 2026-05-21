"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeSlot = {
  time: string;
  available: boolean;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TIME_SLOTS: TimeSlot[] = [
  { time: "9:00 AM", available: true },
  { time: "9:30 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: false },
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: true },
  { time: "1:00 PM", available: false },
  { time: "1:30 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "2:30 PM", available: true },
  { time: "3:00 PM", available: false },
  { time: "3:30 PM", available: true },
  { time: "4:00 PM", available: true },
  { time: "5:00 PM", available: true },
  { time: "5:30 PM", available: false },
  { time: "6:00 PM", available: true },
];

// ─── Calendar Helper ──────────────────────────────────────────────────────────

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [booked, setBooked] = useState(false);

  const today = new Date();
  const calDays = getCalendarDays(calYear, calMonth);

  function book(){
    // 
    setBooked(true);
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  function isPastDay(day: number) {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  }

  const selDay = selectedDate?.day ?? null;
  const selMonth = selectedDate?.month ?? null;
  const selYear = selectedDate?.year ?? null;

  // ── Confirmation screen ────────────────────────────────────────────────────
  if (booked) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 14L10.5 19.5L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">You&apos;re booked!</h2>
          <p className="text-[#888] text-sm mb-6">
            {MONTH_NAMES[calMonth]} {selectedDate?.day}, {calYear} at {selectedTime}
          </p>
          <div className="bg-white border border-[#ebe8e2] rounded-2xl p-5 text-left mb-6">
            <p className="text-sm font-semibold text-[#1a1a1a] mb-1">RentApart</p>
            {/* <p className="text-sm text-[#888]">#3 Molave Street, Cebu City</p> */}
            <p className="text-sm text-[#888] mt-3">
              A confirmation has been sent to{" "}
              <span className="text-[#1a1a1a]">{form.email}</span>
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-[#1a1a1a] underline underline-offset-4"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans">

      <div className="max-w-2xl mx-auto px-4 py-8">

        <button
          onClick={() => {
            if (step === 1) {
              window.history.back();
            } else {
              setStep((prev) => (prev - 1) as 1 | 2);
            }
          }}
          className="
            flex items-center gap-1 text-sm mb-5
            hover:text-foreground
            hover:bg-black/10
            rounded-full
            px-3 py-1.5
            transition-all duration-150
          "
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          Back
        </button>

        {/* STEP 1 — Date & Time */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Pick a date & time</h1>
            <p className="text-sm text-[#aaa] mb-6">Choose when you'd like to come in</p>

            {/* Calendar */}
            <div className="bg-white border border-[#ebe8e2] rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-[#f5f3ef] rounded-xl transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M11 13L7 9L11 5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="text-sm font-semibold text-[#1a1a1a]">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-[#f5f3ef] rounded-xl transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M7 5L11 9L7 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="text-center text-xs text-[#aaa] font-medium py-1.5">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-y-1">
                {calDays.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const past = isPastDay(day);
                  const sel = selectedDate === day;
                  const isToday =
                    day === today.getDate() &&
                    calMonth === today.getMonth() &&
                    calYear === today.getFullYear();
                  return (
                    <button
                      key={day}
                      disabled={past}
                      onClick={() => { setSelectedDate(day); setSelectedTime(""); }}
                      className={`
                        relative mx-auto w-9 h-9 rounded-full text-sm transition-all flex items-center justify-center
                        ${past ? "text-[#d0cec9] cursor-not-allowed" :
                          sel ? "bg-[#1a1a1a] text-white font-semibold" :
                          "text-[#1a1a1a] hover:bg-[#f5f3ef]"}
                      `}
                    >
                      {day}
                      {isToday && !sel && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1a1a1a]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate ? (
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a] mb-3">
                  Available times —{" "}
                  <span className="font-normal text-[#888]">
                    {MONTH_NAMES[calMonth]} {selectedDate}
                  </span>
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`
                        py-2.5 rounded-xl text-sm border font-medium transition-all
                        ${!slot.available
                          ? "text-[#d0cdc8] border-[#f0ede8] cursor-not-allowed bg-white"
                          : selectedTime === slot.time
                          ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                          : "bg-white border-[#ebe8e2] text-[#1a1a1a] hover:border-[#999]"
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#ccc] text-center py-4">Select a date to see available times</p>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 — Details */}
        {step === 2 && (
          <div>
            {/* Booking summary pill */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#ebe8e2] rounded-full px-4 py-2 mb-6">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1.5" y="2" width="11" height="10.5" rx="2" stroke="#aaa" strokeWidth="1.2"/>
                <path d="M4.5 1V3M9.5 1V3" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M1.5 5.5H12.5" stroke="#aaa" strokeWidth="1.2"/>
              </svg>
              <span className="text-xs text-[#888]">
                {MONTH_NAMES[calMonth]} {selectedDate}, {calYear}
              </span>
              <span className="text-[#d0cdc8]">·</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#aaa" strokeWidth="1.2"/>
                <path d="M7 4.5V7L8.5 8.5" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-[#888]">{selectedTime}</span>
            </div>

            <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Your details</h1>
            <p className="text-sm text-[#aaa] mb-6">Almost done — just fill in your info</p>

            <div className="space-y-3 mb-5">
              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs font-semibold text-[#888] uppercase tracking-wide block mb-1.5">
                    {field === "name" ? "Full name" : field === "email" ? "Email address" : "Phone number"}
                  </label>
                  <input
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={
                      field === "name" ? "e.g. Maria Santos" :
                      field === "email" ? "maria@email.com" : "+63 917 000 0000"
                    }
                    className="w-full bg-white border border-[#ebe8e2] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#d0cdc8] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-[#888] uppercase tracking-wide block mb-1.5">
                  Notes <span className="normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any preferences or special requests..."
                  className="w-full bg-white border border-[#ebe8e2] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#d0cdc8] focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="bg-[#f5f3ef] rounded-2xl p-4 text-sm mb-6">
              <p className="font-semibold text-[#1a1a1a] mb-1 text-sm">Cancellation policy</p>
              <p className="text-[#999] text-xs leading-relaxed">
                Cancel or reschedule up to 24 hours before your appointment at no charge.
                *Write here cancelation policy*
              </p>
            </div>

            <button
              onClick={() => { if (form.name && form.email && form.phone) setBooked(true); }}
              disabled={!form.name || !form.email || !form.phone}
              className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Confirm booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}