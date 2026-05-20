import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthToolbar } from "@/components/auth-toolbar";

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
        <AuthProvider>
          <AuthToolbar />
          {children}
          
        </AuthProvider>
      </body>
    </html>
  );
}
