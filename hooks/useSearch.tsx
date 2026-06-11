import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [where, setWhere] = useState(() => searchParams.get("where") ?? "");
  const [placeId, setPlaceId] = useState(() => searchParams.get("city_google_place_id") ?? "");

  const [numOfGuests, setNumOfGuests] = useState(() => {
    const g = Number(searchParams.get("guests"));
    return g >= 1 ? g : 1;
  });

  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] =
    useState<google.maps.places.AutocompletePrediction[]>([]);

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // -----------------------------
  // SYNC FROM URL
  // -----------------------------
  useEffect(() => {
    setWhere(searchParams.get("where") ?? "");
    setPlaceId(searchParams.get("city_google_place_id") ?? "");

    const g = Number(searchParams.get("guests"));
    setNumOfGuests(g >= 1 ? g : 1);
  }, [searchParams]);

  // -----------------------------
  // GOOGLE AUTOCOMPLETE INIT
  // -----------------------------
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

  // -----------------------------
  // LOCATION INPUT
  // -----------------------------
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
    setWhere(prediction.description);
    setPlaceId(prediction.place_id);
    setPredictions([]);
    setOpen(false);
  };

  // -----------------------------
  // GUESTS
  // -----------------------------
  const incrementGuests = () => setNumOfGuests((n) => n + 1);
  const decrementGuests = () => setNumOfGuests((n) => Math.max(1, n - 1));

  // -----------------------------
  // SEARCH
  // -----------------------------
  const search = useCallback(() => {
    const params = new URLSearchParams();

    if (where) params.set("where", where);
    if (placeId) params.set("city_google_place_id", placeId);
    if (numOfGuests > 1) params.set("guests", String(numOfGuests));

    router.push(`/listings?${params.toString()}`);
  }, [where, placeId, numOfGuests, router]);

  // -----------------------------
  // 🔥 REMOVE SINGLE FILTER (NEW)
  // -----------------------------
  const removeFilter = (key: "where" | "guests") => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "where") {
      setWhere("");
      setPlaceId("");
      params.delete("where");
      params.delete("city_google_place_id");
    }

    if (key === "guests") {
      setNumOfGuests(1);
      params.delete("guests");
    }

    router.replace(`/listings?${params.toString()}`, { scroll: false });
  };

  // -----------------------------
  // 🔥 CLEAR ALL FILTERS (NEW)
  // -----------------------------
  const clearAllFilters = () => {
    setWhere("");
    setPlaceId("");
    setNumOfGuests(1);

    router.replace("/listings", { scroll: false });
  };

  return {
    where,
    numOfGuests,
    open,
    predictions,
    placeId,

    handleLocationChange,
    selectPrediction,

    incrementGuests,
    decrementGuests,
    setOpen,

    search,

    removeFilter,
    clearAllFilters,
  };
}

export default useSearch;