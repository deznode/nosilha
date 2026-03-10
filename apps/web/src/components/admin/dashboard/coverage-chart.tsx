"use client";

import { Map } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { TownCoverageData } from "@/types/admin";

interface CoverageChartProps {
  data: TownCoverageData[];
  isLoading?: boolean;
}

const CHART_COLORS = [
  "var(--color-ocean-blue)",
  "var(--color-valley-green)",
  "var(--color-bougainvillea)",
  "var(--color-sunny-yellow)",
];

export function CoverageChart({ data, isLoading }: CoverageChartProps) {
  if (isLoading) {
    return (
      <div className="border-hairline bg-surface rounded-lg border p-6 shadow-sm">
        <div className="bg-surface-alt mb-4 h-6 w-32 animate-pulse rounded" />
        <div className="bg-surface-alt h-40 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="border-hairline bg-surface rounded-lg border p-6 shadow-sm">
      <h3 className="text-body mb-4 flex items-center text-lg font-bold">
        <Map size={20} className="text-ocean-blue mr-2" />
        Coverage by Town
      </h3>
      <div className="h-40 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-subtle)",
              }}
              labelStyle={{
                color: "var(--color-text-primary)",
              }}
              itemStyle={{
                color: "var(--color-text-secondary)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="text-muted flex items-center text-xs"
          >
            <div
              className="mr-1 h-2 w-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}
