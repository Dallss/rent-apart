import { AuthProvider } from "./AuthProvider";
import { GoogleMapsProvider } from "./GoogleMapsProvider";
import { QueryProvider } from "./QueryProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function Providers({ children }: { children: React.ReactNode }) {
   return (
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
         <AuthProvider>
            <GoogleMapsProvider>
               <QueryProvider>{children}</QueryProvider>
            </GoogleMapsProvider>
         </AuthProvider>
      </GoogleOAuthProvider>
   );
}
