// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import useRuntimeConfig from "@/hooks/useRuntimeConfig";

// type ApiResponse<T> = {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: T[];
// };

// type HorizontalInfiniteScrollProps<T> = {
//   initialUrl: string;

//   children: (item: T) => React.ReactNode;

//   loadingComponent?: React.ReactNode;
//   errorComponent?: (error: string) => React.ReactNode;

//   emptyComponent?: React.ReactNode;

//   className?: string;
// };

// export default function HorizontalInfiniteScroll<T>({
//   initialUrl,
//   children,
//   emptyComponent,
// }: HorizontalInfiniteScrollProps<T>) {
//   const [data, setData] = useState<T[]>([]);
//   const [url, setUrl] = useState(initialUrl);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [hasMore, setHasMore] = useState(true);

//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const sentinelRef = useRef<HTMLDivElement | null>(null);
//   const observerRef = useRef<IntersectionObserver | null>(null);
//   const abortRef = useRef<AbortController | null>(null);

//   const { config } = useRuntimeConfig();

//   const fetchData = useCallback(async () => {
//     if (!url || loading || !hasMore) return;

//     setLoading(true);
//     setError(null);

//     // cancel previous request if still running
//     abortRef.current?.abort();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     try {
//       const res = await fetch(url, {
//         signal: controller.signal,
//       });

//       if (!res.ok) throw new Error("Failed to fetch");

//       const json: ApiResponse<T> = await res.json();

//       setData((prev) => [...prev, ...json.results]);

//       if (json.next) setUrl(json.next);
//       else setHasMore(false);

//     } 
//     catch (err: any) {
//       if (err.name !== "AbortError") {
//         setError(err.message || "Error loading data");
//       }
//     } 
//     finally {
//       setLoading(false);
//     }
//   }, [url, loading, hasMore]);

//   // initial load
//   useEffect(() => {
//     if (!config) return;
//     fetchData();
//   }, [config, fetchData]);

//   // intersection observer (horizontal scroll trigger)
//   useEffect(() => {
//     const sentinel = sentinelRef.current;
//     const container = containerRef.current;

//     if (!sentinel || !container) return;

//     observerRef.current?.disconnect();

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           fetchData();
//         }
//       },
//       {
//         root: container,
//         rootMargin: "100px",
//         threshold: 0.1,
//       }
//     );

//     observerRef.current.observe(sentinel);

//     return () => observerRef.current?.disconnect();
//   }, [fetchData]);

//   return (
//    <div
//       ref={containerRef}
//       className="flex gap-3 p-2 overflow-x-auto overflow-y-hidden scroll-smooth"
//    >
//       { children }

//       {/* sentinel */}
//       {hasMore && (
//         <div ref={sentinelRef} style={{ width: 1 }} />
//       )}
//     </div>
//   );
// }