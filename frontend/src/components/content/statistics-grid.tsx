"use client";

interface Statistic {
  value: string;
  label: string;
  description: string;
  color: "ocean-blue" | "valley-green" | "bougainvillea-pink" | "sunny-yellow";
}

interface StatisticsGridProps {
  statistics: Statistic[];
}

export function StatisticsGrid({ statistics }: StatisticsGridProps) {
  const colorClasses = {
    "ocean-blue": {
      gradient: "from-ocean-blue/10",
      text: "text-ocean-blue",
    },
    "valley-green": {
      gradient: "from-valley-green/10",
      text: "text-valley-green",
    },
    "bougainvillea-pink": {
      gradient: "from-bougainvillea-pink/10",
      text: "text-bougainvillea-pink",
    },
    "sunny-yellow": {
      gradient: "from-sunny-yellow/10",
      text: "text-sunny-yellow",
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {statistics.map((stat, index) => (
        <div
          key={index}
          className={`${colorClasses[stat.color].gradient} rounded-lg bg-gradient-to-br to-transparent p-4 text-center`}
        >
          <div
            className={`${colorClasses[stat.color].text} mb-1 text-2xl font-bold`}
          >
            {stat.value}
          </div>
          <div className="text-text-primary text-sm font-medium">
            {stat.label}
          </div>
          <div className="text-text-secondary text-xs">{stat.description}</div>
        </div>
      ))}
    </div>
  );
}
