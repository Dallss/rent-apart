"use client";

import { useState } from "react";
import Image from "next/image";
import ImageGalleryModal from "./ImageGalleryModal";

export interface ListingImage {
   id: number;
   image_url: string;
   caption: string;
}

interface Props {
   images: ListingImage[];
   isOwner: boolean;
   listingId: number;
}

export default function ListingImages({ images, isOwner, listingId }: Props) {
   const [open, setOpen] = useState(false);

   if (images.length === 0) return null;

   const [primary, ...rest] = images;
   const slots = rest.slice(0, 4);
   const hiddenCount = Math.max(0, images.length - 5);
   const hasModal = images.length >= 5;
   // Owners with < 5 images get a fixed 4-cell right grid with an "add photos" slot at [3]
   const ownerAddMode = isOwner && !hasModal;

   return (
      <>
         <div className="w-full h-[520px] grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* LEFT — primary image */}
            <div className="relative h-[260px] md:h-full">
               <Image
                  src={primary.image_url}
                  alt={primary.caption || "Main photo"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-3xl"
               />
            </div>

            {/* RIGHT — 2×2 thumbnail grid */}
            {(slots.length > 0 || ownerAddMode) && (
               <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[260px] md:h-full">
                  {(ownerAddMode ? [0, 1, 2, 3] : slots.map((_, i) => i)).map(
                     (i) => {
                        const img = slots[i];
                        const isLast = i === 3;

                        /* ── ≥5 images: last slot = "+N / view all" trigger ── */
                        if (isLast && hasModal && img) {
                           return (
                              <button
                                 key="modal-trigger"
                                 type="button"
                                 onClick={() => setOpen(true)}
                                 className="relative w-full h-full overflow-hidden rounded-2xl"
                              >
                                 <Image
                                    src={img.image_url}
                                    alt={img.caption || `Photo ${i + 2}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover brightness-50"
                                 />
                                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                    <span className="text-white text-2xl font-bold drop-shadow-sm">
                                       {hiddenCount > 0
                                          ? `+${hiddenCount}`
                                          : "⊞"}
                                    </span>
                                    <span className="text-white/80 text-xs font-medium">
                                       {hiddenCount > 0
                                          ? "more photos"
                                          : "view all"}
                                    </span>
                                 </div>
                              </button>
                           );
                        }

                        /* ── Owner <5 images: last slot = "Add photos" button ── */
                        if (isLast && ownerAddMode) {
                           return (
                              <button
                                 key="add-photos"
                                 type="button"
                                 onClick={() => setOpen(true)}
                                 className="relative w-full h-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-1.5 transition-colors"
                              >
                                 <span className="text-xl">📷</span>
                                 <span className="text-xs font-medium text-gray-400">
                                    Add photos
                                 </span>
                              </button>
                           );
                        }

                        /* ── Regular image thumbnail ── */
                        if (img) {
                           return (
                              <div
                                 key={img.id}
                                 className="relative w-full h-full"
                              >
                                 <Image
                                    src={img.image_url}
                                    alt={img.caption || `Photo ${i + 2}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover rounded-2xl"
                                 />
                              </div>
                           );
                        }

                        /* ── Empty placeholder (owner layout padding) ── */
                        return (
                           <div
                              key={`empty-${i}`}
                              className="rounded-2xl bg-gray-100/60"
                           />
                        );
                     },
                  )}
               </div>
            )}
         </div>

         {open && (
            <ImageGalleryModal
               images={images}
               isOwner={isOwner}
               listingId={listingId}
               onClose={() => setOpen(false)}
            />
         )}
      </>
   );
}
