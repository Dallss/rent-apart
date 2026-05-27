import Link from "next/link";
import Listing from "./Listing";

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
    <div>
      <div className="ml-3">
        <h1 className="font-sans font-light tracking-wide sm:text-2xl">
          {title}
        </h1>
      </div>

      <ul className="mb-10 flex w-full overflow-x-auto overflow-y-hidden">
        {listings.map((item) => (
          <li key={item.id}>
            <Link href={`/listings/${item.id}`}>
              <Listing item={item} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}