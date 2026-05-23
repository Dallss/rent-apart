// components/pathname-provider.tsx
"use client";

import { usePathname } from "next/navigation";

export default function PathnameProvider({
  children,
}: {
  children: (pathname: string) => React.ReactNode;
}) {
  const pathname = usePathname();

  return children(pathname);
}