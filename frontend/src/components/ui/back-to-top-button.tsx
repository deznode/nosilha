"use client";

import { motion } from "framer-motion";
import { smoothScrollTo } from "@/lib/smooth-scroll";

export function BackToTopButton() {
  const handleScrollToTop = () => {
    smoothScrollTo({ top: 0 });
  };

  return (
    <div className="mt-16 text-center">
      <motion.button
        onClick={handleScrollToTop}
        className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue focus-ring inline-flex items-center rounded-md border-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:text-white hover:shadow-md"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 10px 25px -5px rgba(0, 90, 141, 0.2)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </motion.svg>
        Back to Top
      </motion.button>
    </div>
  );
}
