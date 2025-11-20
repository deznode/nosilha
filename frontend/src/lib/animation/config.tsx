// lib/animation/config.ts
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface MotionConfig {
  reducedMotion: boolean;
}

const MotionConfigContext = createContext<MotionConfig>({
  reducedMotion: false,
});

export function MotionConfigProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <MotionConfigContext.Provider value={{ reducedMotion }}>
      {children}
    </MotionConfigContext.Provider>
  );
}

export function useMotionConfig() {
  return useContext(MotionConfigContext);
}
