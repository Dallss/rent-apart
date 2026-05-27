import Link from "next/link";
import ListingCard from "./ListingCard";

type ListingsSectionProps = {
  title: string;
  listings: {
    id: string;
    title: string;
    neighborhood: string;
    rent: number;
    bedrooms: number;
    blurb: string;
    image?: string;
  }[];
};

export default function ListingCollection({
  title,
  listings,
}: ListingsSectionProps) {
  return (
    <div className="mb-8">
      <div className="ml-3 mb-1">
        <h1 className="font-sans font-light tracking-wide sm:text-xl font-playfair">
          {title}
        </h1>
      </div>

      <ul className="flex w-full overflow-x-auto overflow-y-hidden">
        {listings.map((item) => (
          <li key={item.id}>
            <Link href={`/listings/${item.id}`}>
              <ListingCard item={item} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}