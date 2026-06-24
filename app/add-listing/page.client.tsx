"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/auth/api";
import { AnimatePresence, motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

type Amenity = { id: number; name: string; icon: string };
type Choice = [string, string]; // [value, display_label]

type Metadata = {
   amenities: Amenity[];
   listing_types: Choice[];
   property_types: Choice[];
};

type FormData = {
   // Step 1
   title: string;
   city: string; // display name from Google
   city_google_place_id: string;
   property_type: string;
   listing_type: string;
   bedrooms: number;
   bathrooms: number;
   // Step 2
   monthly_rent: string;
   description: string;
   amenities: number[]; // array of amenity IDs
   hero_image: File | null;
   // Step 3
   additional_images: AdditionalImage[];
};

type FieldErrors = Partial<Record<keyof FormData | "server", string>>;

type CloudinarySig = {
   timestamp: number;
   signature: string;
   api_key: string;
   cloud_name: string;
   folder: string;
};

type AdditionalImage = {
   file: File;
   caption: string;
};

type UploadProgress = {
   message: string;
   current: number;
   total: number;
} | null;

// ── Constants ──────────────────────────────────────────────────────────────────

const STEPS: { number: Step; label: string }[] = [
   { number: 1, label: "Basics" },
   { number: 2, label: "Details" },
   { number: 3, label: "Photos" },
];

const EMPTY_FORM: FormData = {
   title: "",
   city: "",
   city_google_place_id: "",
   property_type: "",
   listing_type: "",
   bedrooms: 1,
   bathrooms: 1,
   monthly_rent: "",
   description: "",
   amenities: [],
   hero_image: null,
   additional_images: [],
};

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
   return (
      <div className="flex items-center gap-2 mb-8">
         {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center gap-2">
               <div className="flex items-center gap-2">
                  <div
                     className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        current === s.number
                           ? "bg-gray-900 text-white"
                           : current > s.number
                             ? "bg-emerald-500 text-white"
                             : "bg-gray-100 text-gray-400"
                     }`}
                  >
                     {current > s.number ? "✓" : s.number}
                  </div>
                  <span
                     className={`text-sm font-medium ${
                        current === s.number ? "text-gray-900" : "text-gray-400"
                     }`}
                  >
                     {s.label}
                  </span>
               </div>
               {i < STEPS.length - 1 && (
                  <div className="h-px w-6 bg-gray-200" />
               )}
            </div>
         ))}
      </div>
   );
}

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({
   label,
   error,
   children,
}: {
   label: string;
   error?: string;
   children: React.ReactNode;
}) {
   return (
      <div className="flex flex-col gap-1.5">
         <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
         </label>
         {children}
         {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
   );
}

const inputCls =
   "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white transition-colors";

// ── Stepper control ────────────────────────────────────────────────────────────

function Stepper({
   value,
   min,
   onChange,
   zeroLabel,
}: {
   value: number;
   min: number;
   onChange: (v: number) => void;
   zeroLabel?: string;
}) {
   return (
      <div className="flex items-center gap-3">
         <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-xl leading-none select-none"
         >
            −
         </button>
         <span className="w-14 text-center text-sm font-semibold text-gray-900">
            {value === 0 && zeroLabel ? zeroLabel : value}
         </span>
         <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-xl leading-none select-none"
         >
            +
         </button>
      </div>
   );
}

// ── City autocomplete ──────────────────────────────────────────────────────────

function CityAutocomplete({
   value,
   placeId,
   error,
   onSelect,
}: {
   value: string;
   placeId: string;
   error?: string;
   onSelect: (city: string, placeId: string) => void;
}) {
   // `value` is the single source of truth — parent updates it on every keystroke
   // via onSelect(), so we don't need a separate local input state.
   const [open, setOpen] = useState(false);
   const [predictions, setPredictions] = useState<
      google.maps.places.AutocompletePrediction[]
   >([]);

   const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
      null,
   );
   const debounceRef = useRef<NodeJS.Timeout | null>(null);

   // Init autocomplete service once Maps is loaded
   useEffect(() => {
      if (typeof window !== "undefined" && window.google?.maps?.places) {
         serviceRef.current = new google.maps.places.AutocompleteService();
      }
   }, []);

   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const text = e.target.value;
      // Typing clears the confirmed place ID; parent state drives the input value
      onSelect(text, "");
      setOpen(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!text.trim()) {
         setPredictions([]);
         return;
      }

      debounceRef.current = setTimeout(() => {
         if (!serviceRef.current && window.google?.maps?.places) {
            serviceRef.current = new google.maps.places.AutocompleteService();
         }
         if (!serviceRef.current) return;

         serviceRef.current.getPlacePredictions(
            {
               input: text,
               types: ["(cities)"],
            },
            (results, status) => {
               if (status !== google.maps.places.PlacesServiceStatus.OK) {
                  setPredictions([]);
                  return;
               }
               setPredictions(results ?? []);
            },
         );
      }, 350);
   }

   function handleSelect(
      prediction: google.maps.places.AutocompletePrediction,
   ) {
      const city = prediction.structured_formatting.main_text;
      setPredictions([]);
      setOpen(false);
      onSelect(city, prediction.place_id);
   }

   const confirmed = !!placeId;

   return (
      <div className="relative">
         <div className="relative">
            <input
               className={
                  inputCls +
                  (confirmed
                     ? " pr-8 border-emerald-400 bg-emerald-50/30"
                     : error
                       ? " border-red-300"
                       : "")
               }
               placeholder="Search for a city…"
               value={value}
               autoComplete="off"
               onChange={handleChange}
               onFocus={() => setOpen(true)}
               onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            {confirmed && (
               <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">
                  ✓
               </span>
            )}
         </div>

         {error && !confirmed && (
            <p className="mt-1 text-xs text-red-500">{error}</p>
         )}

         <AnimatePresence>
            {open && value.trim() && (
               <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
               >
                  {predictions.length === 0 ? (
                     <p className="px-4 py-3 text-sm text-gray-400">
                        No cities found
                     </p>
                  ) : (
                     predictions.map((p) => (
                        <div
                           key={p.place_id}
                           onMouseDown={() => handleSelect(p)}
                           className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                           <span className="text-base">📍</span>
                           <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">
                                 {p.structured_formatting.main_text}
                              </span>
                              <span className="text-xs text-gray-400 truncate">
                                 {p.structured_formatting.secondary_text}
                              </span>
                           </div>
                        </div>
                     ))
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

// ── Step 1: Property basics ────────────────────────────────────────────────────

function StepOne({
   form,
   errors,
   metadata,
   set,
}: {
   form: FormData;
   errors: FieldErrors;
   metadata: Metadata | undefined;
   set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
   return (
      <div className="space-y-5">
         <Field label="Listing title" error={errors.title}>
            <input
               className={inputCls}
               placeholder="e.g. Cebu IT Park Studio"
               value={form.title}
               onChange={(e) => set("title", e.target.value)}
            />
         </Field>

         <Field label="City" error={errors.city_google_place_id}>
            <CityAutocomplete
               value={form.city}
               placeId={form.city_google_place_id}
               error={errors.city_google_place_id}
               onSelect={(city, placeId) => {
                  set("city", city);
                  set("city_google_place_id", placeId);
               }}
            />
            {!form.city_google_place_id && form.city && (
               <p className="text-xs text-amber-600">
                  Select a suggestion to confirm the city
               </p>
            )}
         </Field>

         <div className="grid grid-cols-2 gap-4">
            <Field label="Property type" error={errors.property_type}>
               <select
                  className={inputCls}
                  value={form.property_type}
                  onChange={(e) => set("property_type", e.target.value)}
               >
                  <option value="">Select…</option>
                  {metadata?.property_types.map(([value, label]) => (
                     <option key={value} value={value}>
                        {label}
                     </option>
                  ))}
               </select>
            </Field>

            <Field label="Listing type" error={errors.listing_type}>
               <select
                  className={inputCls}
                  value={form.listing_type}
                  onChange={(e) => set("listing_type", e.target.value)}
               >
                  <option value="">Select…</option>
                  {metadata?.listing_types.map(([value, label]) => (
                     <option key={value} value={value}>
                        {label}
                     </option>
                  ))}
               </select>
            </Field>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <Field label="Bedrooms" error={errors.bedrooms}>
               <Stepper
                  value={form.bedrooms}
                  min={0}
                  zeroLabel="Studio"
                  onChange={(v) => set("bedrooms", v)}
               />
            </Field>

            <Field label="Bathrooms" error={errors.bathrooms}>
               <Stepper
                  value={form.bathrooms}
                  min={1}
                  onChange={(v) => set("bathrooms", v)}
               />
            </Field>
         </div>
      </div>
   );
}

// ── Step 2: Rental details ────────────────────────────────────────────────────

function StepTwo({
   form,
   errors,
   metadata,
   set,
}: {
   form: FormData;
   errors: FieldErrors;
   metadata: Metadata | undefined;
   set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
   function toggleAmenity(id: number) {
      const current = form.amenities;
      const next = current.includes(id)
         ? current.filter((a) => a !== id)
         : [...current, id];
      set("amenities", next);
   }

   return (
      <div className="space-y-5">
         <Field label="Monthly rent (₱)" error={errors.monthly_rent}>
            <input
               className={inputCls}
               type="number"
               min={0}
               placeholder="e.g. 18000"
               value={form.monthly_rent}
               onChange={(e) => set("monthly_rent", e.target.value)}
            />
         </Field>

         <Field label="Description" error={errors.description}>
            <textarea
               className={inputCls + " resize-none h-28"}
               placeholder="Describe your property — highlights, nearby landmarks, included utilities…"
               value={form.description}
               onChange={(e) => set("description", e.target.value)}
            />
         </Field>

         <Field label="Amenities" error={errors.amenities}>
            {!metadata ? (
               <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                     <div
                        key={i}
                        className="h-10 rounded-lg bg-gray-100 animate-pulse"
                     />
                  ))}
               </div>
            ) : (
               <div className="grid grid-cols-2 gap-2">
                  {metadata.amenities.map((amenity) => {
                     const checked = form.amenities.includes(amenity.id);
                     return (
                        <button
                           key={amenity.id}
                           type="button"
                           onClick={() => toggleAmenity(amenity.id)}
                           className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
                              checked
                                 ? "border-gray-900 bg-gray-900 text-white"
                                 : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                           }`}
                        >
                           <span className="text-base leading-none">
                              {amenity.icon}
                           </span>
                           <span className="truncate">{amenity.name}</span>
                        </button>
                     );
                  })}
               </div>
            )}
         </Field>

         <Field label="Hero image" error={errors.hero_image}>
            <label
               className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 text-sm transition-colors ${
                  form.hero_image
                     ? "border-gray-400 bg-gray-50"
                     : "border-gray-200 bg-gray-50 hover:bg-gray-100"
               }`}
            >
               {form.hero_image ? (
                  <div className="flex flex-col items-center gap-1">
                     <img
                        src={URL.createObjectURL(form.hero_image)}
                        alt="Hero preview"
                        className="h-32 w-full max-w-xs rounded-lg object-cover"
                     />
                     <span className="text-xs text-gray-500 mt-2">
                        {form.hero_image.name}
                     </span>
                     <span className="text-xs text-gray-400">
                        Click to replace
                     </span>
                  </div>
               ) : (
                  <>
                     <span className="text-3xl">📷</span>
                     <span className="text-gray-500">
                        Click to upload cover photo
                     </span>
                     <span className="text-xs text-gray-400">
                        JPG, PNG, WebP — shown as the listing thumbnail
                     </span>
                  </>
               )}
               <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                     set("hero_image", e.target.files?.[0] ?? null)
                  }
               />
            </label>
         </Field>
      </div>
   );
}

// ── Step 3: Additional photos ─────────────────────────────────────────────────

function StepThree({
   form,
   set,
}: {
   form: FormData;
   set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
   function addImages(files: FileList | null) {
      if (!files) return;
      const incoming: AdditionalImage[] = Array.from(files).map((file) => ({
         file,
         caption: "",
      }));
      set("additional_images", [...form.additional_images, ...incoming]);
   }

   function removeImage(index: number) {
      set(
         "additional_images",
         form.additional_images.filter((_, i) => i !== index),
      );
   }

   function updateCaption(index: number, caption: string) {
      set(
         "additional_images",
         form.additional_images.map((img, i) =>
            i === index ? { ...img, caption } : img,
         ),
      );
   }

   return (
      <div className="space-y-5">
         <p className="text-sm text-gray-600">
            Add more photos to showcase your listing. They appear in the gallery
            alongside the cover photo. Captions are optional.
         </p>

         {/* Upload zone */}
         <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-7 text-sm hover:bg-gray-100 transition-colors">
            <span className="text-3xl">🖼️</span>
            <span className="text-gray-500 font-medium">
               Click to add photos
            </span>
            <span className="text-xs text-gray-400">
               Select multiple at once
            </span>
            <input
               type="file"
               accept="image/*"
               multiple
               className="hidden"
               onChange={(e) => addImages(e.target.files)}
            />
         </label>

         {/* Preview grid */}
         {form.additional_images.length > 0 && (
            <div>
               <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  {form.additional_images.length} photo
                  {form.additional_images.length !== 1 ? "s" : ""} added
               </p>
               <div className="grid grid-cols-2 gap-4">
                  {form.additional_images.map((img, i) => (
                     <div key={i} className="flex flex-col gap-1.5">
                        <div className="relative group aspect-video">
                           <img
                              src={URL.createObjectURL(img.file)}
                              alt={`Photo ${i + 1}`}
                              className="h-full w-full rounded-lg object-cover"
                           />
                           <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                           >
                              ✕
                           </button>
                        </div>
                        <input
                           className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                           placeholder="Caption (optional)"
                           value={img.caption}
                           onChange={(e) => updateCaption(i, e.target.value)}
                        />
                     </div>
                  ))}
               </div>
            </div>
         )}

         {form.additional_images.length === 0 && (
            <p className="text-xs text-gray-400 text-center">
               Additional photos are optional — you can skip this step.
            </p>
         )}
      </div>
   );
}

// ── Cloudinary upload helper ─────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string> {
   const sigRes = await fetchApi("/api/media/cloudinary/signature/");
   if (!sigRes.ok) throw new Error("Failed to get upload signature");
   const sig = (await sigRes.json()) as CloudinarySig;

   const fd = new global.FormData();
   fd.append("file", file);
   fd.append("api_key", sig.api_key);
   fd.append("timestamp", String(sig.timestamp));
   fd.append("signature", sig.signature);
   fd.append("folder", sig.folder);

   const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
      { method: "POST", body: fd },
   );
   if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cloudinary upload failed: ${text}`);
   }
   const data = await res.json();
   return data.secure_url as string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AddListingClientPage() {
   const router = useRouter();
   const [step, setStep] = useState<Step>(1);
   const [form, setForm] = useState<FormData>(EMPTY_FORM);
   const [errors, setErrors] = useState<FieldErrors>({});
   const [submitting, setSubmitting] = useState(false);
   const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);

   const { data: metadata } = useQuery<Metadata>({
      queryKey: ["listing-metadata"],
      queryFn: async () => {
         const res = await fetchApi("/api/listings/metadata/");
         if (!res.ok) throw new Error("Failed to load metadata");
         return res.json();
      },
      staleTime: Infinity,
   });

   function set<K extends keyof FormData>(key: K, value: FormData[K]) {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
   }

   // ── Validation ─────────────────────────────────────────

   function validateStep1(): boolean {
      const e: FieldErrors = {};
      if (!form.title.trim()) e.title = "Required";
      if (!form.city_google_place_id)
         e.city_google_place_id = "Select a city from the suggestions";
      if (!form.property_type) e.property_type = "Required";
      if (!form.listing_type) e.listing_type = "Required";
      setErrors(e);
      return Object.keys(e).length === 0;
   }

   function validateStep2(): boolean {
      const e: FieldErrors = {};
      if (!form.monthly_rent || Number(form.monthly_rent) <= 0)
         e.monthly_rent = "Enter a valid rent amount";
      if (!form.description.trim()) e.description = "Required";
      if (form.amenities.length === 0)
         e.amenities = "Select at least one amenity";
      if (!form.hero_image) e.hero_image = "A cover photo is required";
      setErrors(e);
      return Object.keys(e).length === 0;
   }

   // ── Navigation ─────────────────────────────────────────

   function handleNext() {
      if (step === 1 && validateStep1()) setStep(2);
      if (step === 2 && validateStep2()) setStep(3);
   }

   function handleBack() {
      if (step === 2) setStep(1);
      if (step === 3) setStep(2);
   }

   // ── Submit ─────────────────────────────────────────────────────

   async function handleSubmit() {
      if (!validateStep2()) {
         setStep(2);
         return;
      }

      setSubmitting(true);
      setErrors({});

      try {
         // 1. Upload hero image to Cloudinary
         setUploadProgress({
            message: "Uploading cover photo…",
            current: 0,
            total: 1,
         });
         const heroUrl = await uploadToCloudinary(form.hero_image!);

         // 2. Create the listing (JSON body, hero URL is now a string)
         setUploadProgress({
            message: "Creating listing…",
            current: 1,
            total: 1,
         });
         const res = await fetchApi("/api/listings/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               title: form.title,
               description: form.description,
               city: form.city,
               city_google_place_id: form.city_google_place_id,
               property_type: form.property_type,
               listing_type: form.listing_type,
               monthly_rent: form.monthly_rent,
               bedrooms: form.bedrooms,
               bathrooms: form.bathrooms,
               amenities: form.amenities,
               hero_image_url: heroUrl,
            }),
         });

         if (!res.ok) {
            const text = await res.text();
            let msg = `Failed to create listing (${res.status})`;
            try {
               const json = JSON.parse(text);
               const firstKey = Object.keys(json)[0];
               if (firstKey) {
                  const firstMsg = Array.isArray(json[firstKey])
                     ? json[firstKey][0]
                     : json[firstKey];
                  msg = `${firstKey}: ${firstMsg}`;
               }
            } catch {
               msg = text || msg;
            }
            setErrors({ server: msg });
            setSubmitting(false);
            setUploadProgress(null);
            return;
         }

         const listing = await res.json();
         // The create endpoint returns the ListingWrite serializer which omits `id`.
         // Attempt to read it from the response first; if absent, fetch the most
         // recently created listing for this user to retrieve its id.
         let listingId = listing.id as number | undefined;

         if (!listingId) {
            const myRes = await fetchApi(
               "/api/listings/?mine=true&ordering=-id&limit=1",
            );
            if (myRes.ok) {
               const myData = await myRes.json();
               const results: { id: number }[] = Array.isArray(myData)
                  ? myData
                  : (myData.results ?? []);
               listingId = results[0]?.id;
            }
         }

         // 3. Register the hero image as a listing image too
         await fetchApi(`/api/listings/${listingId}/images/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_url: heroUrl }),
         });

         // 4. Upload each additional photo to Cloudinary then POST to listing images
         const photos = form.additional_images;
         console.log(
            `[images] starting upload for ${photos.length} photo(s), listingId=${listingId}`,
         );

         if (!listingId) {
            console.warn(
               "[images] could not determine listingId — skipping photo upload",
            );
            router.push("/manage-listings");
            return;
         }

         for (let i = 0; i < photos.length; i++) {
            setUploadProgress({
               message: `Uploading photo ${i + 1} of ${photos.length}…`,
               current: i,
               total: photos.length,
            });
            try {
               console.log(
                  `[images] [${i + 1}/${photos.length}] uploading to Cloudinary…`,
                  photos[i].file,
               );
               const imageUrl = await uploadToCloudinary(photos[i].file);
               console.log(
                  `[images] [${i + 1}/${photos.length}] Cloudinary OK →`,
                  imageUrl,
               );

               console.log(
                  `[images] [${i + 1}/${photos.length}] POSTing to /api/listings/${listingId}/images/`,
               );
               await fetchApi(`/api/listings/${listingId}/images/`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                     image_url: imageUrl,
                     ...(photos[i].caption
                        ? { caption: photos[i].caption }
                        : {}),
                  }),
               });
               console.log(`[images] [${i + 1}/${photos.length}] POST OK`);
            } catch (err) {
               console.error(
                  `[images] [${i + 1}/${photos.length}] FAILED`,
                  err,
               );
            }
         }

         console.log("[images] loop done");

         router.push("/manage-listings");
      } catch (err) {
         setErrors({
            server: err instanceof Error ? err.message : "Something went wrong",
         });
         setSubmitting(false);
         setUploadProgress(null);
      }
   }

   // ── Render ─────────────────────────────────────────────

   return (
      <main className="min-h-screen bg-[#fafafa] px-6 py-10">
         <div className="mx-auto max-w-lg">
            <div className="mb-8">
               <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                  Host dashboard
               </p>
               <h1 className="text-3xl font-semibold text-gray-900">
                  Add listing
               </h1>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
               <StepIndicator current={step} />

               {step === 1 && (
                  <StepOne
                     form={form}
                     errors={errors}
                     metadata={metadata}
                     set={set}
                  />
               )}
               {step === 2 && (
                  <StepTwo
                     form={form}
                     errors={errors}
                     metadata={metadata}
                     set={set}
                  />
               )}
               {step === 3 && <StepThree form={form} set={set} />}

               {errors.server && (
                  <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                     {errors.server}
                  </div>
               )}

               {/* Upload progress */}
               {uploadProgress && (
                  <div className="mt-4 space-y-2">
                     <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{uploadProgress.message}</span>
                        {uploadProgress.total > 1 && (
                           <span>
                              {uploadProgress.current}/{uploadProgress.total}
                           </span>
                        )}
                     </div>
                     <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                           className="h-full bg-gray-900 rounded-full transition-all duration-300"
                           style={{
                              width:
                                 uploadProgress.total > 0
                                    ? `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`
                                    : "100%",
                           }}
                        />
                     </div>
                  </div>
               )}

               {/* Actions */}
               <div className="mt-6 flex gap-3">
                  {step === 1 ? (
                     <button
                        type="button"
                        onClick={() => router.push("/manage-listings")}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                     >
                        Cancel
                     </button>
                  ) : (
                     <button
                        type="button"
                        onClick={handleBack}
                        disabled={submitting}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                     >
                        Back
                     </button>
                  )}

                  {step < 3 ? (
                     <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                     >
                        Next
                     </button>
                  ) : (
                     <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-60"
                     >
                        {submitting ? "Publishing…" : "Publish listing"}
                     </button>
                  )}
               </div>
            </div>
         </div>
      </main>
   );
}
