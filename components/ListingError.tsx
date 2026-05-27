import { CloudOff } from "lucide-react";

export default function ListingError() {
  return (
    <div className="mb-10 flex min-h-[320px] w-full items-center justify-center rounded-[36px] border border-[#e8e3dc] bg-[#f4f1ec] px-6 py-16">
      
      <div className="flex max-w-2xl flex-col items-center text-center">
        
        {/* Matte icon container */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#e6ddd3] bg-[#efe9e2]">
          <CloudOff
            size={38}
            strokeWidth={1.8}
            className="text-[#d96b38]"
          />
        </div>

        {/* Heading */}
        <h2
          className="
            mb-4
            text-[46px]
            font-medium
            tracking-[-0.04em]
            text-[#1f1f1f]
          "
          style={{
            fontFamily:
              '"Plus Jakarta Sans", "Inter", "SF Pro Display", sans-serif',
          }}
        >
          The apartments are hiding.
        </h2>

        {/* Subtext */}
        <p
          className="
            max-w-xl
            text-[18px]
            font-normal
            leading-8
            text-[#6f6a64]
          "
          style={{
            fontFamily:
              '"Plus Jakarta Sans", "Inter", "SF Pro Text", sans-serif',
          }}
        >
          Our backend is currently negotiating with several overworked
          hamsters. Please try again in a moment.
        </p>

        {/* Status chips */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          
          <div className="rounded-full border border-[#e4dbd1] bg-[#f8f5f1] px-5 py-2 text-sm font-medium text-[#b96a45]">
            API confidence: questionable
          </div>

          <div className="rounded-full border border-[#e4dbd1] bg-[#f8f5f1] px-5 py-2 text-sm font-medium text-[#b96a45]">
            Hamster morale: unstable
          </div>
        </div>
      </div>
    </div>
  );
}