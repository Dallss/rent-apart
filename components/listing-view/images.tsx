import Image from "next/image";

export default function Images() {
  return (
    <div className="w-full h-[520px] grid grid-cols-1 md:grid-cols-2 gap-2">

      {/* LEFT BIG IMAGE */}
      <div className="relative h-[260px] md:h-full md:col-span-1">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470"
          alt="Large Nature"
          fill
          priority
          className="object-cover rounded-3xl"
        />
      </div>

      {/* RIGHT GRID */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[260px] md:h-full">

        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt="Nature 1"
            fill
            className="object-cover rounded-2xl"
          />
        </div>

        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e"
            alt="Nature 2"
            fill
            className="object-cover rounded-2xl"
          />
        </div>

        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
            alt="Nature 3"
            fill
            className="object-cover rounded-2xl"
          />
        </div>

        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt="Nature 4"
            fill
            className="object-cover rounded-2xl"
          />
        </div>

      </div>

    </div>
  );
}