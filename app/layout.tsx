import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { NavBar } from "@/components/NavBar";
import { QueryProvider } from "../providers/queryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />

        <QueryProvider>
          <AuthProvider>
            <NavBar />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}