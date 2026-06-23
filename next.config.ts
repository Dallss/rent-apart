import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   turbopack: {
      root: __dirname,
   },

   async headers() {
      return [
         {
            source: "/(.*)",
            headers: [
               {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin-allow-popups",
               },
            ],
         },
      ];
   },

   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "images.unsplash.com",
         },
         {
            protocol: "https",
            hostname: "lh3.googleusercontent.com",
         },
         {
            protocol: "http",
            hostname: "localhost",
            port: "3000",
            pathname: "/media/**",
         },
         {
            protocol: "http",
            hostname: "localhost",
            port: "8000",
            pathname: "/media/**",
         },

         {
            protocol: "https",
            hostname: "res.cloudinary.com",
         },
      ],
   },
};

export default nextConfig;
