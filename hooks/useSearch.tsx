// useSearch.tsx
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const PROPERTY_TYPES = {
  any: "Any type",
  apartment: "Apartment",
  house: "House",
  condo: "Condo",
  studio: "Studio",
} as const;

export type PropertyType = keyof typeof PROPERTY_TYPES;

function isPropertyType(value: string | null): value is PropertyType {
  return value !== null && value in PROPERTY_TYPES;
}

function useSearch() {
  const searchParams = useSearchParams();

  const [type, setType] = useState<PropertyType>(() => {
    const t = searchParams.get("type");
    return isPropertyType(t) ? t : "any";
  });

  const [where, setWhere] = useState(() => searchParams.get("where") ?? "");
  const [placeId, setPlaceId] = useState(() => searchParams.get("placeId") ?? "");
  const [numOfGuests, setNumOfGuests] = useState(() => {
    const g = Number(searchParams.get("guests"));
    return g >= 1 ? g : 1;
  });

  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState(
    [] as google.maps.places.AutocompletePrediction[]
  );

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // Sync state when URL params change externally (e.g. back/forward navigation)
  useEffect(() => {
    const t = searchParams.get("type");
    setType(isPropertyType(t) ? t : "any");
    setWhere(searchParams.get("where") ?? "");
    setPlaceId(searchParams.get("placeId") ?? "");
    const g = Number(searchParams.get("guests"));
    setNumOfGuests(g >= 1 ? g : 1);
  }, [searchParams]);

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

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWhere(value);
    setPlaceId("");
    setOpen(true);

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
        { input: value, componentRestrictions: { country: "ph" }, types: ["geocode"] },
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

  const selectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    setWhere(prediction.description);
    setPlaceId(prediction.place_id);
    setPredictions([]);
    setOpen(false);
  };

  const incrementGuests = () => setNumOfGuests((n) => n + 1);
  const decrementGuests = () => setNumOfGuests((n) => Math.max(1, n - 1));

  const search = useCallback(() => {
    const params = new URLSearchParams();
    if (where) params.set("where", where);
    if (placeId) params.set("placeId", placeId);
    if (type !== "any") params.set("type", type);
    if (numOfGuests > 1) params.set("guests", String(numOfGuests));

    router.push(`/listings?${params.toString()}`);
  }, [where, placeId, type, numOfGuests, router]);

  return {
    where,
    type,
    numOfGuests,
    open,
    predictions,
    placeId,
    handleLocationChange,
    selectPrediction,
    setType,
    incrementGuests,
    decrementGuests,
    setOpen,
    search,
    typeLabel: PROPERTY_TYPES[type],
  };
}

export default useSearch;