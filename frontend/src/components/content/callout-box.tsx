"use client";

import { ReactNode } from "react";

interface CalloutBoxProps {
  title?: string;
  children: ReactNode;
  variant?:
    | "ocean-valley"
    | "valley-ocean"
    | "pink-yellow"
    | "ocean"
    | "valley"
    | "pink"
    | "yellow";
  className?: string;
}

export function CalloutBox({
  title,
  children,
  variant = "ocean-valley",
  className = "",
}: CalloutBoxProps) {
  const variantClasses = {
    "ocean-valley": {
      gradient: "from-ocean-blue/5 to-valley-green/5",
      border: "border-ocean-blue",
    },
    "valley-ocean": {
      gradient: "from-valley-green/5 to-ocean-blue/5",
      border: "border-valley-green",
    },
    "pink-yellow": {
      gradient: "from-bougainvillea-pink/5 to-sobrado-ochre/5",
      border: "border-bougainvillea-pink",
    },
    ocean: {
      gradient: "from-ocean-blue/5 to-ocean-blue/10",
      border: "border-ocean-blue",
    },
    valley: {
      gradient: "from-valley-green/5 to-valley-green/10",
      border: "border-valley-green",
    },
    pink: {
      gradient: "from-bougainvillea-pink/5 to-bougainvillea-pink/10",
      border: "border-bougainvillea-pink",
    },
    yellow: {
      gradient: "from-sobrado-ochre/5 to-sobrado-ochre/10",
      border: "border-sobrado-ochre",
    },
  };

  return (
    <div
      className={`${variantClasses[variant].gradient} ${variantClasses[variant].border} rounded-lg border-l-4 bg-gradient-to-r p-6 ${className}`}
    >
      {title && (
        <h4 className="text-text-primary mb-3 text-lg font-semibold">
          {title}
        </h4>
      )}
      <div className="text-text-secondary">{children}</div>
    </div>
  );
}
