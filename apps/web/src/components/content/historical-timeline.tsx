"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

/**
 * HistoricalTimeline Component
 *
 * Renders a timeline of historical events with dates, titles, and descriptions.
 * Designed for cultural heritage content pages.
 */

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

interface HistoricalTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function HistoricalTimeline({
  events,
  className,
}: HistoricalTimelineProps) {
  return (
    <section className={clsx("mt-16", className)}>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-text-primary mb-8 text-center font-serif text-2xl font-bold"
      >
        Key Historical Periods
      </motion.h3>

      <div className="space-y-6">
        {events.map((event, index) => (
          <motion.div
            key={`${event.date}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface border-hairline shadow-subtle hover:shadow-medium flex items-start space-x-4 rounded-lg border p-6 transition-shadow duration-300"
          >
            <div className="w-16 flex-shrink-0 text-center">
              <span className="text-ocean-blue font-bold">{event.date}</span>
            </div>
            <div>
              <h4 className="text-text-primary font-semibold">{event.title}</h4>
              <p className="text-text-secondary">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
