// This is the logic for searchbars/filter-uis across the webpage.

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [place, setPlace] = useState(() => searchParams.get("place") ?? "");
  const [placeId, setPlaceId] = useState(
    () => searchParams.get("city_google_place_id") ?? ""
  );
  const [bedrooms, setBedrooms] = useState(
    () => searchParams.get("bedrooms") ?? ""
  );

  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("min_rent") ?? ""
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("max_rent") ?? ""
  );
  const [listingType, setListingType] = useState(
    () => searchParams.get("listing_type") ?? ""
  );
  const [furnished, setFurnished] = useState(
    () => searchParams.get("is_furnished") ?? ""
  );

  // SYNC FROM URL
  useEffect(() => {
    setPlace(searchParams.get("place") ?? "");
    setPlaceId(searchParams.get("city_google_place_id") ?? "");
    setBedrooms(searchParams.get("bedrooms") ?? "");

    setMinPrice(searchParams.get("min_rent") ?? "");
    setMaxPrice(searchParams.get("max_rent") ?? "");
    setListingType(searchParams.get("listing_type") ?? "");
    setFurnished(searchParams.get("is_furnished") ?? "");
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

    if (minPrice) params.set("min_rent", minPrice);
    if (maxPrice) params.set("max_rent", maxPrice);
    if (listingType) params.set("listing_type", listingType);
    if (furnished) params.set("is_furnished", furnished);

    router.push(`/listings?${params.toString()}`);
  }, [
    place,
    placeId,
    bedrooms,
    minPrice,
    maxPrice,
    listingType,
    furnished,
    router,
  ]);

  const removeFilter = (
    key:
      | "place"
      | "bedrooms"
      | "minPrice"
      | "maxPrice"
      | "listingType"
      | "furnished"
  ) => {
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

      case "minPrice":
        setMinPrice("");
        params.delete("min_rent");
        break;

      case "maxPrice":
        setMaxPrice("");
        params.delete("max_rent");
        break;

      case "listingType":
        setListingType("");
        params.delete("listing_type");
        break;

      case "furnished":
        setFurnished("");
        params.delete("is_furnished");
        break;
    }

    router.replace(`/listings?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setPlace("");
    setPlaceId("");
    setBedrooms("");

    setMinPrice("");
    setMaxPrice("");
    setListingType("");
    setFurnished("");

    router.replace("/listings", { scroll: false });
  };

  return {
    place,
    placeId,
    autocompleteOpen,
    predictions,

    bedrooms,
    setBedrooms,

    minPrice,
    setMinPrice,

    maxPrice,
    setMaxPrice,

    listingType,
    setListingType,

    furnished,
    setFurnished,

    handlePlaceChange,
    selectPrediction,
    setAutocompleteOpen,

    removeFilter,
    clearAllFilters,
    search,
  };
}

export default useSearch;