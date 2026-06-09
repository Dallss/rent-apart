import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
import { NavBar } from "@/app/(components)/NavBar";
import Providers from "@/providers";

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
          <Providers>
            <NavBar />
            {children}
          </Providers>
      </body>
    </html>
  );
}