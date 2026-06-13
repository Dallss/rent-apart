export default function ListingImagesLoading() {
   return (
     <div className="w-full h-[520px] grid grid-cols-1 md:grid-cols-2 gap-2 animate-pulse">
 
       {/* LEFT BIG IMAGE */}
       <div className="h-[260px] md:h-full rounded-3xl bg-zinc-200" />
 
       {/* RIGHT GRID */}
       <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[260px] md:h-full">
         <div className="rounded-2xl bg-zinc-200" />
         <div className="rounded-2xl bg-zinc-100" />
         <div className="rounded-2xl bg-zinc-100" />
         <div className="rounded-2xl bg-zinc-200" />
       </div>
 
     </div>
   );
 }