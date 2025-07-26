import React from "react";

export function Logo() {
  return (
    <div className="flex items-center cursor-default">
      <h1 className="text-3xl font-sans text-text-secondary">
        {/* The "N" is styled separately for a distinct look */}
        <span
          className="
            font-serif 
            text-5xl 
            font-bold 
            text-ocean-blue 
            animate-glow 
            mr-1
          "
        >
          N
        </span>
        osilha
      </h1>
    </div>
  );
}
