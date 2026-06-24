"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/auth/api";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────

type ListingImage = {
   id: number;
   image_url: string;
   caption: string;
};

type Listing = {
   id: number;
   title: string;
   is_unfinished: boolean;
   images: ListingImage[];
};

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

// ── Cloudinary upload helper ───────────────────────────────

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
   const data = await res.json();
   return data.secure_url as string;
}

// ── Skeleton ───────────────────────────────────────────────

function PageSkeleton() {
   return (
      <main className="min-h-screen bg-[#fafafa] px-6 py-10">
         <div className="mx-auto max-w-2xl">
            <div className="mb-8 space-y-2">
               <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
               <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
               <div className="h-4 w-64 rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
               <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                     <div
                        key={i}
                        className="aspect-video rounded-lg bg-gray-100 animate-pulse"
                     />
                  ))}
               </div>
            </div>
         </div>
      </main>
   );
}

// ── Page ──────────────────────────────────────────────────

export default function EditListingClientPage({ id }: { id: string }) {
   const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
   const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
   const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);
   const [error, setError] = useState<string | null>(null);

   const {
      data: listing,
      isLoading,
      isError,
      refetch,
   } = useQuery<Listing>({
      queryKey: ["listing-edit", id],
      queryFn: async () => {
         const res = await fetchApi(`/api/listings/${id}/`);
         if (!res.ok) throw new Error("Failed to fetch listing");
         return res.json();
      },
   });

   // ── Helpers ────────────────────────────────────────────

   async function markCompleteIfReady(imageCount: number) {
      if (imageCount >= 5) {
         await fetchApi(`/api/listings/${id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_unfinished: false }),
         });
      }
   }

   // ── Delete existing image ──────────────────────────────

   async function handleDelete(imageId: number) {
      setDeletingIds((prev) => new Set([...prev, imageId]));
      setError(null);
      try {
         const res = await fetchApi(
            `/api/listings/${id}/images/${imageId}/`,
            { method: "DELETE" },
         );
         if (!res.ok)
            throw new Error(`Failed to delete image (${res.status})`);

         const updated = await refetch();
         await markCompleteIfReady(updated.data?.images.length ?? 0);
      } catch (err) {
         setError(
            err instanceof Error ? err.message : "Failed to delete image",
         );
      } finally {
         setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(imageId);
            return next;
         });
      }
   }

   // ── Pending image management ───────────────────────────

   function addPendingImages(files: FileList | null) {
      if (!files) return;
      const incoming: PendingImage[] = Array.from(files).map((file) => ({
         file,
         caption: "",
         preview: URL.createObjectURL(file),
      }));
      setPendingImages((prev) => [...prev, ...incoming]);
   }

   function removePending(index: number) {
      setPendingImages((prev) => {
         const next = [...prev];
         URL.revokeObjectURL(next[index].preview);
         next.splice(index, 1);
         return next;
      });
   }

   function updatePendingCaption(index: number, caption: string) {
      setPendingImages((prev) =>
         prev.map((img, i) => (i === index ? { ...img, caption } : img)),
      );
   }

   // ── Upload pending images ──────────────────────────────

   async function handleUpload() {
      if (pendingImages.length === 0) return;
      setUploading(true);
      setError(null);

      try {
         for (let i = 0; i < pendingImages.length; i++) {
            setUploadProgress({
               message: `Uploading photo ${i + 1} of ${pendingImages.length}…`,
               current: i,
               total: pendingImages.length,
            });

            const imageUrl = await uploadToCloudinary(pendingImages[i].file);
            await fetchApi(`/api/listings/${id}/images/`, {
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

         pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
         setPendingImages([]);

         const updated = await refetch();
         await markCompleteIfReady(updated.data?.images.length ?? 0);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
         setUploading(false);
         setUploadProgress(null);
      }
   }

   // ── Loading / error states ─────────────────────────────

   if (isLoading) return <PageSkeleton />;

   if (isError || !listing) {
      return (
         <main className="min-h-screen bg-[#fafafa] px-6 py-10">
            <div className="mx-auto max-w-2xl space-y-4">
               <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                  Failed to load listing. Please try again.
               </div>
               <Link
                  href="/manage-listings"
                  className="inline-block text-sm text-gray-500 underline"
               >
                  ← Back to listings
               </Link>
            </div>
         </main>
      );
   }

   const imageCount = listing.images.length;
   const needsMore = Math.max(0, 5 - imageCount);
   const isReady = imageCount >= 5;

   // ── Render ─────────────────────────────────────────────

   return (
      <main className="min-h-screen bg-[#fafafa] px-6 py-10">
         <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8">
               <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                  Host dashboard
               </p>
               <h1 className="text-3xl font-semibold text-gray-900">
                  Edit photos
               </h1>
               <p className="mt-1 text-sm text-gray-500">{listing.title}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm space-y-6">
               {/* Status */}
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                     {imageCount} photo{imageCount !== 1 ? "s" : ""}
                  </span>
                  {isReady ? (
                     <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                        ✓ Ready to publish
                     </span>
                  ) : (
                     <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                        Add {needsMore} more to publish
                     </span>
                  )}
               </div>

               {/* Existing images */}
               {listing.images.length > 0 ? (
                  <div>
                     <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Current photos
                     </p>
                     <div className="grid grid-cols-2 gap-3">
                        {listing.images.map((img) => {
                           const isDeleting = deletingIds.has(img.id);
                           return (
                              <div key={img.id} className="flex flex-col gap-1.5">
                                 <div className="relative group aspect-video overflow-hidden rounded-lg bg-gray-100">
                                    <img
                                       src={img.image_url}
                                       alt={img.caption || "Listing photo"}
                                       className="h-full w-full object-cover"
                                    />
                                    {isDeleting ? (
                                       <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                          <span className="text-xs font-medium text-white">
                                             Deleting…
                                          </span>
                                       </div>
                                    ) : (
                                       <button
                                          type="button"
                                          onClick={() => handleDelete(img.id)}
                                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                       >
                                          ✕
                                       </button>
                                    )}
                                 </div>
                                 {img.caption && (
                                    <p className="truncate px-0.5 text-xs text-gray-500">
                                       {img.caption}
                                    </p>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>
               ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                     No photos yet — add some below.
                  </div>
               )}

               {/* Upload zone */}
               <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                     Add photos
                  </p>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-7 text-sm transition-colors hover:bg-gray-100">
                     <span className="text-3xl">🖼️</span>
                     <span className="font-medium text-gray-500">
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
                        onChange={(e) => addPendingImages(e.target.files)}
                     />
                  </label>
               </div>

               {/* Pending images preview */}
               {pendingImages.length > 0 && (
                  <div>
                     <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {pendingImages.length} new photo
                        {pendingImages.length !== 1 ? "s" : ""} to upload
                     </p>
                     <div className="grid grid-cols-2 gap-3">
                        {pendingImages.map((img, i) => (
                           <div key={i} className="flex flex-col gap-1.5">
                              <div className="relative group aspect-video overflow-hidden rounded-lg bg-gray-100">
                                 <img
                                    src={img.preview}
                                    alt={`New photo ${i + 1}`}
                                    className="h-full w-full object-cover"
                                 />
                                 <button
                                    type="button"
                                    onClick={() => removePending(i)}
                                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                 >
                                    ✕
                                 </button>
                              </div>
                              <input
                                 className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
                                 placeholder="Caption (optional)"
                                 value={img.caption}
                                 onChange={(e) =>
                                    updatePendingCaption(i, e.target.value)
                                 }
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Upload progress bar */}
               {uploadProgress && (
                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{uploadProgress.message}</span>
                        <span>
                           {uploadProgress.current}/{uploadProgress.total}
                        </span>
                     </div>
                     <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                           className="h-full rounded-full bg-gray-900 transition-all duration-300"
                           style={{
                              width:
                                 uploadProgress.total > 0
                                    ? `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`
                                    : "0%",
                           }}
                        />
                     </div>
                  </div>
               )}

               {/* Error */}
               {error && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                     {error}
                  </div>
               )}

               {/* Actions */}
               <div className="flex gap-3 pt-2">
                  <Link
                     href="/manage-listings"
                     className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
                  >
                     Done
                  </Link>
                  {pendingImages.length > 0 && (
                     <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
                     >
                        {uploading
                           ? "Uploading…"
                           : `Upload ${pendingImages.length} photo${pendingImages.length !== 1 ? "s" : ""}`}
                     </button>
                  )}
               </div>
            </div>
         </div>
      </main>
   );
}
