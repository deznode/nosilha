// lib/animation/config.ts
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface MotionConfig {
  reducedMotion: boolean;
}

const MotionConfigContext = createContext<MotionConfig>({
  reducedMotion: false,
});

export function MotionConfigProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const listener = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);

    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return (
    <MotionConfigContext.Provider value={{ reducedMotion }}>
      {children}
    </MotionConfigContext.Provider>
  );
}

export function useMotionConfig() {
  return useContext(MotionConfigContext);
}
