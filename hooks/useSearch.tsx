// This is the logic for searchbars/filter-uis across the webpage.

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [place, setPlace] = useState(() => searchParams.get("place") ?? "");
  const [placeId, setPlaceId] = useState(() => searchParams.get("city_google_place_id") ?? "");
  const [bedrooms, setBedrooms] = useState(() => searchParams.get("bedrooms") ?? "");

  // SYNC FROM URL
  useEffect(() => {
    setPlace(searchParams.get("place") ?? "");
    setPlaceId(searchParams.get("city_google_place_id") ?? "");
    setBedrooms(searchParams.get("bedrooms") ?? "");
  }, [searchParams]);

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [predictions, setPredictions] =
    useState<google.maps.places.AutocompletePrediction[]>([]);

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // LOCATION INPUT
  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setPlace(value);
    setPlaceId("");
    setAutocompleteOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setPredictions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (!autocompleteService.current && window.google?.maps?.places) {
        autocompleteService.current =
          new window.google.maps.places.AutocompleteService();
      }

      if (!autocompleteService.current) return;

      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "ph" },
          types: ["geocode"],
        },
        (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            setPredictions([]);
            return;
          }
          setPredictions(results || []);
        }
      );
    }, 400);
  };

  const selectPrediction = (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    setPlace(prediction.description);
    setPlaceId(prediction.place_id);
    setPredictions([]);
    setAutocompleteOpen(false);
  };


  // SEARCH
  const search = useCallback(() => {
    const params = new URLSearchParams();

    if (place) params.set("place", place);
    if (placeId) params.set("city_google_place_id", placeId);
    if (bedrooms) params.set("bedrooms", bedrooms);

    router.push(`/listings?${params.toString()}`);
  }, [place, placeId, router, bedrooms]);

  const removeFilter = (key: "place" | "bedrooms") => {
    const params = new URLSearchParams(searchParams.toString());
  
    switch (key) {
      case "place":
        setPlace("");
        setPlaceId("");
        params.delete("place");
        params.delete("city_google_place_id");
        break;
  
      case "bedrooms":
        setBedrooms("");
        params.delete("bedrooms");
        break;
  
      default:
        break;
    }
  
    router.replace(`/listings?${params.toString()}`, { scroll: false });
  };
  const clearAllFilters = () => {
    setPlace("");
    setPlaceId("");

    router.replace("/listings", { scroll: false });
  };

  return {
    place,
    autocompleteOpen,
    predictions,
    placeId,

    handlePlaceChange,
    selectPrediction,
    setAutocompleteOpen,

    bedrooms,
    setBedrooms,

    removeFilter,
    clearAllFilters,
    search,
  };
}

export default useSearch;