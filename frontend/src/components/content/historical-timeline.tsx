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
  className = "",
}: HistoricalTimelineProps) {
  return (
    <section className={`mt-16 ${className}`}>
      <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
        Key Historical Periods
      </h3>

      <div className="space-y-6">
        {events.map((event, index) => (
          <div
            key={`${event.date}-${index}`}
            className="bg-background-primary border-border-primary flex items-start space-x-4 rounded-lg border p-6 shadow-sm"
          >
            <div className="w-16 flex-shrink-0 text-center">
              <span className="text-ocean-blue font-bold">{event.date}</span>
            </div>
            <div>
              <h4 className="text-text-primary font-semibold">{event.title}</h4>
              <p className="text-text-secondary">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
