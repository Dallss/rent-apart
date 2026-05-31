import { QueryProvider } from "../providers/queryProvider";
import { GoogleMapsProvider } from "@/providers/googleMapsProvider";

export default function Providers({
   children,
 }: {
   children: React.ReactNode;
 }) {
   return (
     <>

      <GoogleMapsProvider>
      <QueryProvider>

         {children}

      </QueryProvider>
      </GoogleMapsProvider>
     </>
   );
 }