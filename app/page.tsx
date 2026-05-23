import { ListingSection } from "@/components/ListingsSection";
import HomeHero from "@/components/HomeHero";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 h-800">
      <HomeHero />
      <SearchBar />
      <ListingSection />
    </main>
  );
}