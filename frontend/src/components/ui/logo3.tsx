import React from "react";

export function Logo() {
  return (
    <div className="flex cursor-default items-center">
      <h1 className="text-text-secondary font-sans text-3xl">
        {/* The "N" is styled separately for a distinct look */}
        <span className="text-ocean-blue animate-glow mr-1 font-serif text-5xl font-bold">
          N
        </span>
        osilha
      </h1>
    </div>
  );
}
