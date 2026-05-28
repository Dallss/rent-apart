import { useEffect, useState } from "react";

type RuntimeConfig = {
  apiUrl: string;
};

export default function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/config");

        if (!res.ok) {
          throw new Error("Failed to load config");
        }

        const data: RuntimeConfig = await res.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
}