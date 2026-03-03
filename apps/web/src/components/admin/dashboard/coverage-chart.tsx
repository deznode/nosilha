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
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 flex items-center text-lg font-bold text-slate-900 dark:text-white">
        <Map size={20} className="mr-2 text-[var(--color-ocean-blue)]" />
        Coverage by Town
      </h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
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
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center text-xs text-slate-500 dark:text-slate-400"
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
