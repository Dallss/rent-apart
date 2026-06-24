"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/auth/api";
import { iconMap, DefaultAmenityIcon } from "@/lib/icons";
import ListingImages from "./ListingImages";
import type { Listing } from "../page";

type AmenityMeta = { id: number; name: string; icon: string };

// ── Types ──────────────────────────────────────────────────

type CloudinarySig = {
   timestamp: number;
   signature: string;
   api_key: string;
   cloud_name: string;
   folder: string;
};

type PendingImage = {
   file: File;
   caption: string;
   preview: string;
};

type UploadProgress = {
   message: string;
   current: number;
   total: number;
} | null;

// ── Cloudinary helper ─────────────────────────────────────

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
   if (!res.ok) throw new Error("Cloudinary upload failed");
   return (await res.json()).secure_url as string;
}

// ── InlineEdit ────────────────────────────────────────────
//
// Wraps any content (passed as children) with a pencil icon.
// Clicking the icon replaces the content with an input/textarea.
// On save it calls onSave(newValue) then dismisses itself.

function InlineEdit({
   children,
   value,
   multiline = false,
   type = "text",
   onSave,
}: {
   children: React.ReactNode;
   value: string;
   multiline?: boolean;
   type?: string;
   onSave: (val: string) => Promise<void>;
}) {
   const [editing, setEditing] = useState(false);
   const [draft, setDraft] = useState(value);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   function open() {
      setDraft(value); // always seed from current prop
      setError(null);
      setEditing(true);
   }

   async function save() {
      setSaving(true);
      setError(null);
      try {
         await onSave(draft);
         setEditing(false);
      } catch (e) {
         setError(e instanceof Error ? e.message : "Save failed");
      } finally {
         setSaving(false);
      }
   }

   if (!editing) {
      return (
         <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">{children}</div>
            <button
               type="button"
               onClick={open}
               title="Edit"
               className="mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
               ✎
            </button>
         </div>
      );
   }

   return (
      <div className="space-y-3">
         {multiline ? (
            <textarea
               // eslint-disable-next-line jsx-a11y/no-autofocus
               autoFocus
               rows={5}
               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none resize-none"
               value={draft}
               onChange={(e) => setDraft(e.target.value)}
            />
         ) : (
            <input
               // eslint-disable-next-line jsx-a11y/no-autofocus
               autoFocus
               type={type}
               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
               value={draft}
               onChange={(e) => setDraft(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") setEditing(false);
               }}
            />
         )}
         {error && <p className="text-xs text-red-500">{error}</p>}
         <div className="flex gap-2">
            <button
               type="button"
               onClick={() => setEditing(false)}
               disabled={saving}
               className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
               Cancel
            </button>
            <button
               type="button"
               onClick={save}
               disabled={saving}
               className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
               {saving ? "Saving…" : "Save"}
            </button>
         </div>
      </div>
   );
}

// ── AmenitiesEdit ────────────────────────────────────────

function AmenitiesEdit({
   currentIds,
   allAmenities,
   onSave,
   onCancel,
}: {
   currentIds: number[];
   allAmenities: AmenityMeta[];
   onSave: (ids: number[]) => Promise<void>;
   onCancel: () => void;
}) {
   const [selected, setSelected] = useState<number[]>(currentIds);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   function toggle(id: number) {
      setSelected((prev) =>
         prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
   }

   async function save() {
      setSaving(true);
      setError(null);
      try {
         await onSave(selected);
      } catch (e) {
         setError(e instanceof Error ? e.message : "Save failed");
         setSaving(false);
      }
   }

   return (
      <div className="space-y-4">
         <div className="flex flex-wrap gap-2">
            {allAmenities.map((amenity) => {
               const isSelected = selected.includes(amenity.id);
               const Icon =
                  iconMap[amenity.icon as keyof typeof iconMap] ??
                  DefaultAmenityIcon;
               return (
                  <button
                     key={amenity.id}
                     type="button"
                     onClick={() => toggle(amenity.id)}
                     className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
                        isSelected
                           ? "bg-orange-50 border-orange-200 text-black shadow-sm"
                           : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                     }`}
                  >
                     <Icon
                        size={14}
                        className={
                           isSelected ? "text-orange-600" : "text-gray-300"
                        }
                     />
                     {amenity.name}
                  </button>
               );
            })}
         </div>
         {error && <p className="text-xs text-red-500">{error}</p>}
         <div className="flex gap-3 text-sm">
            <button
               type="button"
               onClick={onCancel}
               disabled={saving}
               className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
            >
               Cancel
            </button>
            <button
               type="button"
               onClick={save}
               disabled={saving}
               className="font-medium text-gray-900 hover:text-gray-600 disabled:opacity-50"
            >
               {saving ? "Saving…" : "Save"}
            </button>
         </div>
      </div>
   );
}

// ── Main component ────────────────────────────────────────

export default function ListingContent({
   listing,
   isOwner,
}: {
   listing: Listing;
   isOwner: boolean;
}) {
   const router = useRouter();

   // Amenities edit state
   const [editingAmenities, setEditingAmenities] = useState(false);

   // Metadata (amenity list) — only fetched when owner
   const { data: metadata } = useQuery({
      queryKey: ["listing-metadata"],
      queryFn: async () => {
         const res = await fetchApi("/api/listings/metadata/");
         if (!res.ok) throw new Error("Failed to load metadata");
         return res.json() as Promise<{ amenities: AmenityMeta[] }>;
      },
      staleTime: Infinity,
      enabled: isOwner,
   });

   // Rent inline edit state
   const [editingRent, setEditingRent] = useState(false);
   const [rentDraft, setRentDraft] = useState(listing.monthly_rent);
   const [savingRent, setSavingRent] = useState(false);
   const [rentError, setRentError] = useState<string | null>(null);

   async function handleSaveRent() {
      setSavingRent(true);
      setRentError(null);
      try {
         await patchListing({ monthly_rent: rentDraft });
         setEditingRent(false);
      } catch (e) {
         setRentError(e instanceof Error ? e.message : "Save failed");
      } finally {
         setSavingRent(false);
      }
   }

   // Photos upload state
   const [showPhotos, setShowPhotos] = useState(false);
   const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
   const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);
   const [photoError, setPhotoError] = useState<string | null>(null);

   const [publishing, setPublishing] = useState(false);
   const [deleting, setDeleting] = useState(false);

   const monthlyRent = parseFloat(listing.monthly_rent);
   const imageCount = listing.images.length;
   const needsMore = Math.max(0, 5 - imageCount);
   const isReady = imageCount >= 5;
   const isPublished = !listing.is_unfinished;

   // Sets is_unfinished: false (used by the status banner)
   async function handlePublish() {
      setPublishing(true);
      try {
         await patchListing({ is_unfinished: false });
      } finally {
         setPublishing(false);
      }
   }

   // Toggles publish status (used by the price-card button)
   async function handlePublishToggle() {
      setPublishing(true);
      try {
         await patchListing({ is_unfinished: isPublished }); // published → unpublish; draft → publish
      } finally {
         setPublishing(false);
      }
   }

   async function handleDelete() {
      if (!window.confirm("Delete this listing? This cannot be undone."))
         return;
      setDeleting(true);
      try {
         const res = await fetchApi(`/api/listings/${listing.id}/`, {
            method: "DELETE",
         });
         if (res.ok || res.status === 204) {
            router.push("/manage-listings");
         } else {
            throw new Error(`Delete failed (${res.status})`);
         }
      } catch (e) {
         alert(e instanceof Error ? e.message : "Failed to delete listing");
         setDeleting(false);
      }
   }

   // ── Shared patch helper ────────────────────────────────

   async function patchListing(updates: Record<string, unknown>) {
      const res = await fetchApi(`/api/listings/${listing.id}/`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(updates),
      });
      if (!res.ok) {
         const text = await res.text();
         throw new Error(text || `Save failed (${res.status})`);
      }
      router.refresh();
   }

   // ── Photos upload handlers ─────────────────────────────

   function addPendingImages(files: FileList | null) {
      if (!files) return;
      setPendingImages((prev) => [
         ...prev,
         ...Array.from(files).map((file) => ({
            file,
            caption: "",
            preview: URL.createObjectURL(file),
         })),
      ]);
   }

   function removePending(index: number) {
      setPendingImages((prev) => {
         const next = [...prev];
         URL.revokeObjectURL(next[index].preview);
         next.splice(index, 1);
         return next;
      });
   }

   function updateCaption(index: number, caption: string) {
      setPendingImages((prev) =>
         prev.map((img, i) => (i === index ? { ...img, caption } : img)),
      );
   }

   async function handlePhotoUpload() {
      if (pendingImages.length === 0) return;
      setUploading(true);
      setPhotoError(null);

      try {
         for (let i = 0; i < pendingImages.length; i++) {
            setUploadProgress({
               message: `Uploading photo ${i + 1} of ${pendingImages.length}…`,
               current: i,
               total: pendingImages.length,
            });
            const imageUrl = await uploadToCloudinary(pendingImages[i].file);
            await fetchApi(`/api/listings/${listing.id}/images/`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  image_url: imageUrl,
                  ...(pendingImages[i].caption
                     ? { caption: pendingImages[i].caption }
                     : {}),
               }),
            });
         }

         const newCount = imageCount + pendingImages.length;
         if (newCount >= 5) {
            await fetchApi(`/api/listings/${listing.id}/`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ is_unfinished: false }),
            });
         }

         pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
         setPendingImages([]);
         setShowPhotos(false);
         router.refresh();
      } catch (err) {
         setPhotoError(err instanceof Error ? err.message : "Upload failed");
      } finally {
         setUploading(false);
         setUploadProgress(null);
      }
   }

   // ── Render ─────────────────────────────────────────────

   return (
      <>
         {/* HEADER */}
         <section className="mb-6">
            {isOwner ? (
               <InlineEdit
                  value={listing.title}
                  onSave={(val) => patchListing({ title: val })}
               >
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                     {listing.title}
                  </h1>
               </InlineEdit>
            ) : (
               <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                  {listing.title}
               </h1>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-muted">
               <span className="underline cursor-pointer">{listing.city}</span>
            </div>
         </section>

         {/* IMAGES */}
         <section className="overflow-hidden rounded-3xl mb-6">
            <ListingImages
               images={listing.images}
               isOwner={isOwner}
               listingId={listing.id}
            />
         </section>

         {/* OWNER PUBLISH STATUS — below images */}
         {isOwner && (
            <div
               className={`mb-10 flex items-center gap-3 rounded-xl px-4 py-3 ${
                  isPublished
                     ? "border border-green-200 bg-green-50"
                     : isReady
                       ? "border border-amber-200 bg-amber-50"
                       : "border border-amber-100 bg-amber-50"
               }`}
            >
               <span className="text-lg">{isPublished ? "✓" : "📷"}</span>
               <div className="flex-1 min-w-0">
                  {isPublished ? (
                     <p className="text-sm font-medium text-green-800">
                        Published — visible to renters
                     </p>
                  ) : isReady ? (
                     <p className="text-sm font-medium text-amber-800">
                        Ready to publish · {imageCount} photo
                        {imageCount !== 1 ? "s" : ""}
                     </p>
                  ) : (
                     <p className="text-sm font-medium text-amber-800">
                        {imageCount}/{5} photos — add {needsMore} more to
                        publish
                     </p>
                  )}
               </div>
               {!isPublished && isReady && (
                  <button
                     type="button"
                     onClick={handlePublish}
                     disabled={publishing}
                     className="shrink-0 rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                     {publishing ? "Publishing…" : "Publish"}
                  </button>
               )}
            </div>
         )}

         {/* MAIN GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">
            {/* LEFT */}
            <div className="space-y-10">
               {/* Type + bedrooms/bathrooms */}
               <section className="pb-8 border-b border-border">
                  <h2 className="text-2xl font-semibold leading-snug">
                     {listing.listing_type || "Entire rental unit"} in{" "}
                     {listing.city}
                  </h2>
                  <p className="text-muted mt-2">
                     {listing.bedrooms} bedroom
                     {listing.bedrooms !== 1 ? "s" : ""} · {listing.bathrooms}{" "}
                     bath
                     {listing.bathrooms !== 1 ? "s" : ""}
                  </p>
               </section>

               {/* Description */}
               <section className="pb-8 border-b border-border">
                  <h2 className="text-xl font-semibold mb-4">
                     About this place
                  </h2>
                  {isOwner ? (
                     <InlineEdit
                        value={listing.description}
                        multiline
                        onSave={(val) => patchListing({ description: val })}
                     >
                        <p className="text-muted leading-7 max-w-3xl">
                           {listing.description}
                        </p>
                     </InlineEdit>
                  ) : (
                     <p className="text-muted leading-7 max-w-3xl">
                        {listing.description}
                     </p>
                  )}
               </section>

               {/* Amenities */}
               {(listing.amenities?.length > 0 || isOwner) && (
                  <section className="pt-2 pb-8">
                     <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-xl font-semibold">
                           What this place offers
                        </h2>
                        {isOwner && !editingAmenities && (
                           <button
                              type="button"
                              onClick={() => setEditingAmenities(true)}
                              title="Edit amenities"
                              className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                           >
                              ✎
                           </button>
                        )}
                     </div>

                     {editingAmenities && metadata ? (
                        <AmenitiesEdit
                           currentIds={listing.amenities.map((a) => a.id)}
                           allAmenities={metadata.amenities}
                           onSave={async (ids) => {
                              await patchListing({ amenities: ids });
                              setEditingAmenities(false);
                           }}
                           onCancel={() => setEditingAmenities(false)}
                        />
                     ) : editingAmenities ? (
                        <p className="text-sm text-gray-400">
                           Loading amenities…
                        </p>
                     ) : (
                        <div className="flex flex-wrap gap-3">
                           {listing.amenities.map((amenity) => {
                              const Icon =
                                 iconMap[
                                    amenity.icon as keyof typeof iconMap
                                 ] ?? DefaultAmenityIcon;
                              return (
                                 <div
                                    key={amenity.id}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-orange-50 border border-orange-100 text-black shadow-sm transition-all duration-200 hover:bg-orange-100"
                                 >
                                    <Icon
                                       size={16}
                                       className="text-orange-600 shrink-0"
                                    />
                                    <span className="text-sm font-medium">
                                       {amenity.name}
                                    </span>
                                 </div>
                              );
                           })}
                           {listing.amenities.length === 0 && (
                              <p className="text-sm text-gray-400">
                                 No amenities yet — click ✎ to add some.
                              </p>
                           )}
                        </div>
                     )}
                  </section>
               )}
            </div>

            {/* RIGHT */}
            <aside>
               {isOwner ? (
                  /* Owner price card — minimal */
                  <div className="border border-border rounded-3xl p-6 shadow-lg bg-card">
                     <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                        Monthly rate
                     </p>

                     {editingRent ? (
                        <div className="space-y-3">
                           <input
                              // eslint-disable-next-line jsx-a11y/no-autofocus
                              autoFocus
                              type="number"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-2xl font-semibold focus:border-gray-500 focus:outline-none"
                              value={rentDraft}
                              onChange={(e) => setRentDraft(e.target.value)}
                              onKeyDown={(e) => {
                                 if (e.key === "Enter") handleSaveRent();
                                 if (e.key === "Escape") setEditingRent(false);
                              }}
                           />
                           {rentError && (
                              <p className="text-xs text-red-500">
                                 {rentError}
                              </p>
                           )}
                           <div className="flex gap-2">
                              <button
                                 type="button"
                                 onClick={() => setEditingRent(false)}
                                 disabled={savingRent}
                                 className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                 Cancel
                              </button>
                              <button
                                 type="button"
                                 onClick={handleSaveRent}
                                 disabled={savingRent}
                                 className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                              >
                                 {savingRent ? "Saving…" : "Save"}
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center justify-between">
                           <div className="flex items-end gap-1">
                              <span className="text-3xl font-semibold">
                                 ₱{monthlyRent.toLocaleString()}
                              </span>
                              <span className="text-muted mb-1">/ mo</span>
                           </div>
                           <button
                              type="button"
                              onClick={() => {
                                 setRentDraft(listing.monthly_rent);
                                 setRentError(null);
                                 setEditingRent(true);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                              title="Edit rate"
                           >
                              ✎
                           </button>
                        </div>
                     )}

                     {/* Owner action buttons */}
                     <div className="mt-5 pt-5 border-t border-border space-y-2">
                        {/* Publish toggle */}
                        <button
                           type="button"
                           onClick={handlePublishToggle}
                           disabled={
                              publishing ||
                              deleting ||
                              (!isPublished && !isReady)
                           }
                           title={
                              !isPublished && !isReady
                                 ? `Add ${needsMore} more photo${needsMore !== 1 ? "s" : ""} to publish`
                                 : undefined
                           }
                           className={`w-full rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                              isPublished
                                 ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                 : "bg-gray-900 text-white hover:bg-gray-700"
                           }`}
                        >
                           {publishing
                              ? "Saving…"
                              : isPublished
                                ? "Unpublish"
                                : !isReady
                                  ? `Publish (need ${needsMore} more photo${needsMore !== 1 ? "s" : ""})`
                                  : "Publish"}
                        </button>

                        {/* Delete */}
                        <button
                           type="button"
                           onClick={handleDelete}
                           disabled={deleting || publishing}
                           className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                           {deleting ? "Deleting…" : "Delete listing"}
                        </button>
                     </div>
                  </div>
               ) : (
                  /* Non-owner price card — full */
                  <div className="border border-border rounded-3xl p-6 shadow-lg bg-card">
                     <div className="flex items-end gap-1 mb-6">
                        <span className="text-3xl font-semibold">
                           ₱{monthlyRent.toLocaleString()}
                        </span>
                        <span className="text-muted mb-1">/ month</span>
                     </div>

                     <a
                        href="/schedule-tour"
                        className="block text-center w-full bg-accent hover:opacity-90 transition-opacity text-white font-medium py-3 rounded-2xl"
                     >
                        Schedule a Tour
                     </a>

                     <p className="text-center text-xs text-muted mt-3">
                        Monthly breakdown
                     </p>

                     <div className="mt-6 space-y-3 text-sm">
                        <div className="flex justify-between text-muted">
                           <span className="underline">Monthly rent</span>
                           <span>₱{monthlyRent.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between font-semibold">
                           <span>Total monthly payment</span>
                           <span>₱{monthlyRent.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
               )}
            </aside>
         </div>

         {/* REVIEWS (hardcoded) */}
         <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-6">
               Reviews{" "}
               <span className="text-xs font-normal text-zinc-400">
                  (dev note: hardcoded)
               </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                  {
                     initial: "M",
                     name: "Maria Santos",
                     meta: "Stayed 3 months · March 2026",
                     text: "The villa exceeded expectations. The location was quiet, the pool was always clean, and the sea view was incredible every morning.",
                  },
                  {
                     initial: "J",
                     name: "James Reyes",
                     meta: "Stayed 1 month · January 2026",
                     text: "Fast WiFi, spacious rooms, and responsive landlord. Perfect for remote work while staying near the beach.",
                  },
                  {
                     initial: "A",
                     name: "Anna Cruz",
                     meta: "Stayed 6 months · August 2025",
                     text: "Security and amenities were excellent. The furnished interior made moving in incredibly easy.",
                  },
                  {
                     initial: "D",
                     name: "Daniel Lim",
                     meta: "Stayed 2 months · November 2025",
                     text: "One of the best rental experiences I've had. Great neighborhood, clean property, and amazing beachfront view.",
                  },
               ].map((r) => (
                  <div
                     key={r.name}
                     className="rounded-2xl border border-border p-5"
                  >
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold">
                           {r.initial}
                        </div>
                        <div>
                           <p className="font-medium">{r.name}</p>
                           <p className="text-sm text-muted">{r.meta}</p>
                        </div>
                     </div>
                     <p className="text-muted leading-7">{r.text}</p>
                  </div>
               ))}
            </div>
         </section>
      </>
   );
}
