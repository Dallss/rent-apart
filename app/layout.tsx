import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { geistSans, geistMono } from "@/lib/fonts";
import { NavBar } from "@/components/NavBar";
import Providers from "@/providers/Providers";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./globals.css";


export const metadata: Metadata = {
  title: "Rent Apart",
  description: "Landlords list apartments; renters browse and inquire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
      <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
      >
        <AuthProvider>
        
          
          <Providers>
            <NavBar />
            {children}
          </Providers>
          
        </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}