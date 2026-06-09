import Image from "next/image";

interface ListingImage {
  id: number;
  image_url: string;
  caption: string;
}

export default function ListingImages({ images }: { images: ListingImage[] }) {
  const [primary, ...rest] = images;

  return (
    <div className="w-full h-[520px] grid grid-cols-1 md:grid-cols-2 gap-2">

      {/* LEFT BIG IMAGE */}
      {primary && (
        <div className="relative h-[260px] md:h-full md:col-span-1">
          <Image
            src={primary.image_url}
            alt={primary.caption}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-3xl"
          />
        </div>
      )}

      {/* RIGHT GRID */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[260px] md:h-full">
        {rest.map((img) => (
          <div key={img.id} className="relative w-full h-full">
            <Image
              src={img.image_url}
              alt={img.caption}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover rounded-2xl"
            />
          </div>
        ))}
      </div>

    </div>
  );
}