"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/auth/api";

// ── Types ──────────────────────────────────────────────────

type Panel = "edit" | "photos" | null;

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

type EditForm = {
   title: string;
   description: string;
   monthly_rent: string;
   bedrooms: number;
   bathrooms: number;
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
   const data = await res.json();
   return data.secure_url as string;
}

// ── Shared input styles ────────────────────────────────────

const inputCls =
   "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:outline-none";

// ── Sub-panels ────────────────────────────────────────────

function EditPanel({
   listingId,
   initial,
   onDone,
}: {
   listingId: number;
   initial: EditForm;
   onDone: () => void;
}) {
   const router = useRouter();
   const [form, setForm] = useState<EditForm>(initial);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   function set<K extends keyof EditForm>(key: K, value: EditForm[K]) {
      setForm((prev) => ({ ...prev, [key]: value }));
   }

   async function handleSave() {
      setSaving(true);
      setError(null);
      try {
         const res = await fetchApi(`/api/listings/${listingId}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               title: form.title,
               description: form.description,
               monthly_rent: form.monthly_rent,
               bedrooms: form.bedrooms,
               bathrooms: form.bathrooms,
            }),
         });
         if (!res.ok) {
            const text = await res.text();
            let msg = `Failed to save (${res.status})`;
            try {
               const json = JSON.parse(text);
               const firstKey = Object.keys(json)[0];
               if (firstKey) {
                  const val = json[firstKey];
                  msg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
               }
            } catch {
               msg = text || msg;
            }
            throw new Error(msg);
         }
         router.refresh();
         onDone();
      } catch (err) {
         setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
         setSaving(false);
      }
   }

   return (
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
         <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Title</label>
            <input
               className={inputCls}
               value={form.title}
               onChange={(e) => set("title", e.target.value)}
            />
         </div>

         <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">
               Description
            </label>
            <textarea
               rows={4}
               className={inputCls + " resize-none"}
               value={form.description}
               onChange={(e) => set("description", e.target.value)}
            />
         </div>

         <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">
               Monthly rent (₱)
            </label>
            <input
               type="number"
               min={0}
               className={inputCls}
               value={form.monthly_rent}
               onChange={(e) => set("monthly_rent", e.target.value)}
            />
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500">
                  Bedrooms
               </label>
               <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.bedrooms}
                  onChange={(e) => set("bedrooms", Number(e.target.value))}
               />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500">
                  Bathrooms
               </label>
               <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.bathrooms}
                  onChange={(e) => set("bathrooms", Number(e.target.value))}
               />
            </div>
         </div>

         {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
               {error}
            </div>
         )}

         <div className="flex gap-3 pt-1">
            <button
               type="button"
               onClick={onDone}
               disabled={saving}
               className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
               Cancel
            </button>
            <button
               type="button"
               onClick={handleSave}
               disabled={saving}
               className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-60"
            >
               {saving ? "Saving…" : "Save changes"}
            </button>
         </div>
      </div>
   );
}

function PhotosPanel({
   listingId,
   imageCount,
   onDone,
}: {
   listingId: number;
   imageCount: number;
   onDone: () => void;
}) {
   const router = useRouter();
   const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
   const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);
   const [error, setError] = useState<string | null>(null);

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
            await fetchApi(`/api/listings/${listingId}/images/`, {
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
            await fetchApi(`/api/listings/${listingId}/`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ is_unfinished: false }),
            });
         }

         pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
         setPendingImages([]);
         router.refresh();
         onDone();
      } catch (err) {
         setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
         setUploading(false);
         setUploadProgress(null);
      }
   }

   return (
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
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

         {pendingImages.length > 0 && (
            <div>
               <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {pendingImages.length} photo
                  {pendingImages.length !== 1 ? "s" : ""} selected
               </p>
               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pendingImages.map((img, i) => (
                     <div key={i} className="flex flex-col gap-1.5">
                        <div className="relative group aspect-video overflow-hidden rounded-lg bg-gray-100">
                           <img
                              src={img.preview}
                              alt={`Photo ${i + 1}`}
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
                           onChange={(e) => updateCaption(i, e.target.value)}
                        />
                     </div>
                  ))}
               </div>
            </div>
         )}

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

         {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
               {error}
            </div>
         )}

         <div className="flex gap-3">
            <button
               type="button"
               onClick={onDone}
               disabled={uploading}
               className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
               Cancel
            </button>
            {pendingImages.length > 0 && (
               <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-60"
               >
                  {uploading
                     ? "Uploading…"
                     : `Upload ${pendingImages.length} photo${pendingImages.length !== 1 ? "s" : ""}`}
               </button>
            )}
         </div>
      </div>
   );
}

// ── Main component ────────────────────────────────────────

export default function OwnerActions({
   listingId,
   imageCount,
   initialTitle,
   initialDescription,
   initialRent,
   initialBedrooms,
   initialBathrooms,
}: {
   listingId: number;
   imageCount: number;
   initialTitle: string;
   initialDescription: string;
   initialRent: string;
   initialBedrooms: number;
   initialBathrooms: number;
}) {
   const [panel, setPanel] = useState<Panel>(null);

   const needsMore = Math.max(0, 5 - imageCount);
   const isReady = imageCount >= 5;

   function toggle(target: Panel) {
      setPanel((current) => (current === target ? null : target));
   }

   return (
      <div className="mb-8">
         {/* Toolbar */}
         <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
            <div className="flex-1 min-w-0">
               <p className="text-xs font-semibold text-gray-500">
                  Your listing
               </p>
               {isReady ? (
                  <p className="text-xs text-green-600">✓ Published</p>
               ) : (
                  <p className="text-xs text-amber-600">
                     Add {needsMore} more photo{needsMore !== 1 ? "s" : ""} to
                     publish
                  </p>
               )}
            </div>
            <button
               type="button"
               onClick={() => toggle("edit")}
               className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  panel === "edit"
                     ? "border-gray-900 bg-gray-900 text-white"
                     : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
               }`}
            >
               Edit
            </button>
            <button
               type="button"
               onClick={() => toggle("photos")}
               className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  panel === "photos"
                     ? "border-gray-900 bg-gray-900 text-white"
                     : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
               }`}
            >
               Add photos
            </button>
         </div>

         {panel === "edit" && (
            <EditPanel
               listingId={listingId}
               initial={{
                  title: initialTitle,
                  description: initialDescription,
                  monthly_rent: initialRent,
                  bedrooms: initialBedrooms,
                  bathrooms: initialBathrooms,
               }}
               onDone={() => setPanel(null)}
            />
         )}

         {panel === "photos" && (
            <PhotosPanel
               listingId={listingId}
               imageCount={imageCount}
               onDone={() => setPanel(null)}
            />
         )}
      </div>
   );
}
