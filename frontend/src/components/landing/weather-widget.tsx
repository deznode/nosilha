import { CloudSun, Sun, Cloud, CloudRain } from "lucide-react";
import type { WeatherData } from "@/types/landing";

const conditionIcons = {
  sunny: Sun,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  rainy: CloudRain,
};

/**
 * WeatherWidget - Simple weather display
 *
 * Compact card showing current temperature, location, and weather icon.
 * Currently uses static data - can be integrated with weather API later.
 */
export function WeatherWidget({
  temperature,
  location,
  condition,
}: WeatherData) {
  const WeatherIcon = conditionIcons[condition] || CloudSun;

  return (
    <div className="border-hairline bg-surface flex items-center justify-between rounded-2xl border p-6 shadow-sm">
      <div>
        <div className="text-text-secondary mb-1 text-xs font-bold tracking-wider uppercase">
          Current Weather
        </div>
        <div className="text-text-primary text-2xl font-bold">
          {temperature}
        </div>
        <div className="text-text-secondary text-sm">{location}</div>
      </div>
      <div className="text-sobrado-ochre">
        <WeatherIcon size={40} />
      </div>
    </div>
  );
}
