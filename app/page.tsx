import { AllListings } from "@/components/all-listings";
import SearchBar from "@/components/search-bar";

export default function Home() {
  return (
    <>
      <SearchBar />
      <AllListings />
    </>
  );
}