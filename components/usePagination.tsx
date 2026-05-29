import { useCallback, useEffect, useRef, useState } from "react";

type PaginationMeta = {
  limit: number;
  offset: number;
  total?: number;
  hasMore: boolean;
};

type UsePaginationOptions<T> = {
  endpoint: string;
  limit?: number;
  initialOffset?: number;
  immediate?: boolean;
  mapResponse?: (res: any) => { results: T[]; total?: number };
};

export function usePagination<T>({
  endpoint,
  limit = 10,
  initialOffset = 0,
  immediate = true,
  mapResponse,
}: UsePaginationOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meta, setMeta] = useState<PaginationMeta>({
    limit,
    offset: initialOffset,
    hasMore: true,
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (reset = false) => {
      if (loading) return;
      if (!meta.hasMore && !reset) return;

      setLoading(true);
      setError(null);

      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const offset = reset ? initialOffset : meta.offset;

        const res = await fetch(
          `${endpoint}?limit=${limit}&offset=${offset}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Failed to fetch data");

        const json = await res.json();

        const parsed = mapResponse
          ? mapResponse(json)
          : {
              results: json.results ?? json,
              total: json.count,
            };

        setData((prev) =>
          reset ? parsed.results : [...prev, ...parsed.results]
        );

        const newOffset = offset + parsed.results.length;

        setMeta({
          limit,
          offset: newOffset,
          total: parsed.total,
          hasMore:
            parsed.total != null
              ? newOffset < parsed.total
              : parsed.results.length === limit,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, limit, meta.offset, meta.hasMore, loading, initialOffset, mapResponse]
  );

  const reset = useCallback(() => {
    setData([]);
    setMeta({
      limit,
      offset: initialOffset,
      hasMore: true,
    });
  }, [limit, initialOffset]);

  const next = useCallback(() => {
    fetchPage(false);
  }, [fetchPage]);

  const reload = useCallback(() => {
    reset();
    fetchPage(true);
  }, [reset, fetchPage]);

  useEffect(() => {
    if (immediate) {
      fetchPage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return {
    data,
    loading,
    error,
    meta,
    next,
    reload,
    reset,
  };
}