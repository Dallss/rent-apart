export default function ListingLoading() {
   return (
     <ul className="mb-10 flex w-full overflow-hidden">
       {Array.from({ length: 10 }).map((_, index) => (
         <li key={index} className="shrink-0">
           <article className="flex h-full w-[220px] flex-col overflow-hidden p-3">
             
             {/* Image */}
             <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-zinc-200/80 animate-pulse">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.6s_infinite]" />
             </div>
 
             <div className="flex flex-1 flex-col gap-3">
               
               {/* Title */}
               <div className="space-y-2">
                 <div className="h-[15px] w-4/5 rounded-full bg-zinc-200/80 animate-pulse" />
                 <div className="h-[15px] w-2/3 rounded-full bg-zinc-200/60 animate-pulse" />
               </div>
 
               {/* Location + Price */}
               <div className="flex items-center gap-2">
                 <div className="h-[12px] w-1/2 rounded-full bg-zinc-200/70 animate-pulse" />
                 <div className="ml-auto h-[12px] w-[50px] rounded-full bg-zinc-300/70 animate-pulse" />
               </div>
 
               {/* Tags */}
               <div className="mt-1 flex gap-2">
                 <div className="h-7 w-14 rounded-full bg-zinc-200/70 animate-pulse" />
                 <div className="h-7 w-16 rounded-full bg-zinc-200/60 animate-pulse" />
               </div>
             </div>
           </article>
         </li>
       ))}
     </ul>
   );
 }