"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchApi } from "@/lib/auth/api";
import type { ListingImage } from "./ListingImages";

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

// ── Caption editor (per image, owner only) ────────────────

function CaptionEdit({
   image,
   listingId,
}: {
   image: ListingImage;
   listingId: number;
}) {
   const router = useRouter();
   const [draft, setDraft] = useState(image.caption || "");
   const [saving, setSaving] = useState(false);
   const [saved, setSaved] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // Sync draft when parent refreshes with new data
   useEffect(() => {
      if (!saving) setDraft(image.caption || "");
   }, [image.caption, saving]);

   const dirty = draft !== (image.caption || "");

   async function save() {
      setSaving(true);
      setError(null);
      try {
         const res = await fetchApi(
            `/api/listings/${listingId}/images/${image.id}/`,
            {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ caption: draft }),
            },
         );
         if (!res.ok) throw new Error(`Failed (${res.status})`);
         setSaved(true);
         setTimeout(() => setSaved(false), 2000);
         router.refresh();
      } catch (e) {
         setError(e instanceof Error ? e.message : "Save failed");
      } finally {
         setSaving(false);
      }
   }

   return (
      <div className="space-y-1.5">
         <input
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
            placeholder="Add a caption…"
            value={draft}
            onChange={(e) => {
               setDraft(e.target.value);
               setSaved(false);
            }}
            onKeyDown={(e) => {
               if (e.key === "Enter") save();
               if (e.key === "Escape") setDraft(image.caption || "");
            }}
         />
         {(dirty || saved || error) && (
            <div className="flex items-center gap-2">
               {dirty && (
                  <>
                     <button
                        type="button"
                        onClick={() => setDraft(image.caption || "")}
                        disabled={saving}
                        className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                     >
                        {saving ? "Saving…" : "Save"}
                     </button>
                  </>
               )}
               {saved && !dirty && (
                  <span className="text-xs text-green-600 font-medium">✓ Saved</span>
               )}
               {error && (
                  <span className="text-xs text-red-500">{error}</span>
               )}
            </div>
         )}
      </div>
   );
}

// ── Add photos section (owner only) ──────────────────────

function AddPhotosSection({
   listingId,
   imageCount,
}: {
   listingId: number;
   imageCount: number;
}) {
   const router = useRouter();
   const [pending, setPending] = useState<PendingImage[]>([]);
   const [uploading, setUploading] = useState(false);
   const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
   const [error, setError] = useState<string | null>(null);

   function addFiles(files: FileList | null) {
      if (!files) return;
      setPending((prev) => [
         ...prev,
         ...Array.from(files).map((file) => ({
            file,
            caption: "",
            preview: URL.createObjectURL(file),
         })),
      ]);
   }

   function remove(i: number) {
      setPending((prev) => {
         const next = [...prev];
         URL.revokeObjectURL(next[i].preview);
         next.splice(i, 1);
         return next;
      });
   }

   function setCaption(i: number, caption: string) {
      setPending((prev) =>
         prev.map((img, j) => (j === i ? { ...img, caption } : img)),
      );
   }

   async function upload() {
      if (pending.length === 0) return;
      setUploading(true);
      setError(null);

      try {
         for (let i = 0; i < pending.length; i++) {
            setProgress({ current: i, total: pending.length });
            const url = await uploadToCloudinary(pending[i].file);
            await fetchApi(`/api/listings/${listingId}/images/`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  image_url: url,
                  ...(pending[i].caption ? { caption: pending[i].caption } : {}),
               }),
            });
         }

         const newCount = imageCount + pending.length;
         if (newCount >= 5) {
            await fetchApi(`/api/listings/${listingId}/`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ is_unfinished: false }),
            });
         }

         pending.forEach((p) => URL.revokeObjectURL(p.preview));
         setPending([]);
         router.refresh();
      } catch (e) {
         setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
         setUploading(false);
         setProgress(null);
      }
   }

   return (
      <div className="space-y-4">
         <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-sm transition-colors hover:bg-gray-100">
            <span className="text-3xl">🖼️</span>
            <span className="font-medium text-gray-500">Click to add photos</span>
            <span className="text-xs text-gray-400">Select multiple at once</span>
            <input
               type="file"
               accept="image/*"
               multiple
               className="hidden"
               onChange={(e) => addFiles(e.target.files)}
            />
         </label>

         {pending.length > 0 && (
            <>
               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pending.map((img, i) => (
                     <div key={i} className="flex flex-col gap-1.5">
                        <div className="relative group aspect-video overflow-hidden rounded-lg bg-gray-100">
                           <img
                              src={img.preview}
                              alt={`New ${i + 1}`}
                              className="h-full w-full object-cover"
                           />
                           <button
                              type="button"
                              onClick={() => remove(i)}
                              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                           >
                              ✕
                           </button>
                        </div>
                        <input
                           className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
                           placeholder="Caption (optional)"
                           value={img.caption}
                           onChange={(e) => setCaption(i, e.target.value)}
                        />
                     </div>
                  ))}
               </div>

               {progress && (
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-xs text-gray-500">
                        <span>
                           Uploading {progress.current + 1} of {progress.total}…
                        </span>
                        <span>
                           {Math.round(((progress.current) / progress.total) * 100)}%
                        </span>
                     </div>
                     <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                           className="h-full rounded-full bg-gray-900 transition-all duration-300"
                           style={{
                              width: `${Math.round((progress.current / progress.total) * 100)}%`,
                           }}
                        />
                     </div>
                  </div>
               )}

               {error && (
                  <p className="text-sm text-red-500">{error}</p>
               )}

               <button
                  type="button"
                  onClick={upload}
                  disabled={uploading}
                  className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60 transition-colors"
               >
                  {uploading
                     ? "Uploading…"
                     : `Upload ${pending.length} photo${pending.length !== 1 ? "s" : ""}`}
               </button>
            </>
         )}
      </div>
   );
}

// ── Modal ─────────────────────────────────────────────────

export default function ImageGalleryModal({
   images,
   isOwner,
   listingId,
   onClose,
}: {
   images: ListingImage[];
   isOwner: boolean;
   listingId: number;
   onClose: () => void;
}) {
   // Lock body scroll
   useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => {
         document.body.style.overflow = "";
      };
   }, []);

   // Close on Escape
   useEffect(() => {
      function handle(e: KeyboardEvent) {
         if (e.key === "Escape") onClose();
      }
      window.addEventListener("keydown", handle);
      return () => window.removeEventListener("keydown", handle);
   }, [onClose]);

   return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
         />

         {/* Sheet */}
         <div className="relative z-10 flex flex-col w-full max-w-5xl h-[92vh] md:h-[90vh] bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
               <div>
                  <h2 className="text-base font-semibold text-gray-900">
                     All photos
                  </h2>
                  <p className="text-xs text-gray-400">
                     {images.length} photo{images.length !== 1 ? "s" : ""}
                     {isOwner && " · click any caption to edit"}
                  </p>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm"
               >
                  ✕
               </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
               <div className="px-6 py-6 max-w-4xl mx-auto">
                  {/* Image grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {images.map((img, i) => (
                        <div key={img.id} className="space-y-2.5">
                           <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                              <Image
                                 src={img.image_url}
                                 alt={img.caption || `Photo ${i + 1}`}
                                 fill
                                 sizes="(max-width: 640px) 100vw, 50vw"
                                 className="object-cover"
                              />
                           </div>

                           {isOwner ? (
                              <CaptionEdit image={img} listingId={listingId} />
                           ) : img.caption ? (
                              <p className="text-sm text-gray-500 px-0.5 leading-relaxed">
                                 {img.caption}
                              </p>
                           ) : null}
                        </div>
                     ))}
                  </div>

                  {/* Add photos — owner only */}
                  {isOwner && (
                     <div className="mt-10 pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                           Add more photos
                        </h3>
                        <AddPhotosSection
                           listingId={listingId}
                           imageCount={images.length}
                        />
                     </div>
                  )}

                  {/* Bottom padding */}
                  <div className="h-8" />
               </div>
            </div>
         </div>
      </div>
   );
}
