import { Suspense } from "react";
import Listings from "./components/Listings";
import HomeHero from "./components/HomeHero";
import SearchBar from "./components/SearchBar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col gap-4">
      <img
        src="/herobg.png"
        className="absolute brightness-90 inset-0 inset-y-[-100px] w-full h-[500px] object-cover"
        alt=""
      />

      <HomeHero />

      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      <Listings />
      <Footer />
    </main>
  );
}