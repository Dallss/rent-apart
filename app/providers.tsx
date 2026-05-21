"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { getConfig } from "./lib/config";

const ConfigContext = createContext(null);

export function useConfig() {
  return useContext(ConfigContext);
}

export default function Providers({ children }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  if (!config) return null; // or loading UI

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}