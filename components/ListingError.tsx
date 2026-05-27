import { CloudOff } from "lucide-react";

export default function ListingError() {
  return (
    <div className="mb-10 flex min-h-[320px] w-full items-center justify-center border border-[#d8d0c6] bg-gradient-to-b from-[#f6f2ec] to-[#efe9e2] px-6 py-16 shadow-sm">
      <div className="flex max-w-2xl flex-col items-center text-center">
        
        {/* Icon container with stronger emphasis */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#d6c8bb] bg-[#f3ede6] shadow-md">
          <CloudOff
            size={40}
            strokeWidth={1.8}
            className="text-[#d3542a]"
          />
        </div>

        {/* Heading - stronger contrast */}
        <h2
          className="mb-4 text-[46px] font-semibold tracking-[-0.04em] text-[#141414]"
          style={{
            fontFamily:
              '"Plus Jakarta Sans", "Inter", "SF Pro Display", sans-serif',
          }}
        >
          The apartments are hiding.
        </h2>

        {/* Subtext - slightly darker for readability */}
        <p
          className="max-w-xl text-[18px] font-normal leading-8 text-[#5f5953]"
          style={{
            fontFamily:
              '"Plus Jakarta Sans", "Inter", "SF Pro Text", sans-serif',
          }}
        >
          Our backend is currently negotiating with several overworked hamsters.
          Please try again in a moment.
        </p>

        {/* Status chips - higher contrast + subtle emphasis */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          
          <div className="rounded-full border border-[#d9c7b8] bg-[#fff3eb] px-5 py-2 text-sm font-semibold text-[#b84f2b] shadow-sm">
            API confidence: questionable
          </div>

          <div className="rounded-full border border-[#d9c7b8] bg-[#fff3eb] px-5 py-2 text-sm font-semibold text-[#b84f2b] shadow-sm">
            Hamster morale: unstable
          </div>
        </div>
      </div>
    </div>
  );
}