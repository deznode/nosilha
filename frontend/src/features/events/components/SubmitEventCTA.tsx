"use client";

import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * SubmitEventCTA - Call to action for submitting community events
 */
export function SubmitEventCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="from-valley-green mt-20 flex flex-col items-center justify-between rounded-3xl bg-gradient-to-r to-emerald-700 p-8 text-center text-white shadow-xl md:flex-row md:p-12 md:text-left"
    >
      <div className="mb-8 max-w-2xl md:mb-0">
        <h2 className="mb-4 font-serif text-3xl font-bold">
          Organizing a Community Event?
        </h2>
        <p className="text-lg text-white/90">
          Nosilha is built by the community, for the community. If you are
          hosting a festival, cleanup, or cultural gathering, list it here for
          free.
        </p>
      </div>
      <button className="text-valley-green flex items-center rounded-full bg-white px-8 py-4 font-bold whitespace-nowrap shadow-lg transition-all hover:bg-gray-100">
        <PlusCircle className="mr-2 h-5 w-5" />
        Submit an Event
      </button>
    </motion.div>
  );
}
