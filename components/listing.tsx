type ListingProps = {
   item: {
     id: string;
     title: string;
     neighborhood: string;
     rent: number;
     bedrooms: number;
     blurb: string;
     image?: string;
   };
 };
 
function formatRent(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}
 
 export default function Listing({ item }: ListingProps) {
   return (
     <article className="flex h-full flex-col w-[210px] overflow-hidden p-[10px]">
 
       <div className="aspect-[1/1] overflow-hidden w-full rounded-2xl mb-[5px] shadow-xs">
         {item.image ? (
           <img
             src={item.image}
             alt={item.title}
             className="h-full w-full object-cover"
           />
         ) : (
           <div className="flex h-full items-center justify-center text-xs text-zinc-400">
             No image
           </div>
         )}
       </div>
 
       <div className="flex flex-1 flex-col">

        <p className="text-[14px] font-[510] truncate">{item.title}</p>
          

        <dl className="flex text-xs text-zinc-500 text-foreground"> 
          <p className="text-xs">
            {item.neighborhood}
            <span className="mx-1 text-zinc-400">•</span>
            {item.bedrooms === 0 ? "Studio" : `${item.bedrooms} bed`}
          </p>

          <dd className="ml-auto text-xs">
            {formatRent(item.rent)} / mo
          </dd>
        </dl>
          
       </div>
     </article>
   );
 }