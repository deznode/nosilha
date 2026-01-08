"use client";

import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyActivityData } from "@/types/admin";

interface ActivityChartProps {
  data: WeeklyActivityData[];
  isLoading?: boolean;
}

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
  if (isLoading) {
    return (
      <div className="border-hairline bg-surface rounded-lg border p-6 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-surface-alt h-6 w-40 animate-pulse rounded" />
        </div>
        <div className="bg-surface-alt h-64 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="border-hairline bg-surface rounded-lg border p-6 shadow-sm lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-body flex items-center text-lg font-bold">
          <TrendingUp
            size={20}
            className="mr-2 text-[var(--color-ocean-blue)]"
          />
          Weekly Engagement
        </h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border-subtle)"
            />
            <XAxis
              dataKey="day"
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-primary)",
                borderRadius: "8px",
                border: "1px solid var(--color-border-subtle)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar
              dataKey="suggestions"
              name="Suggestions"
              fill="var(--color-ocean-blue)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="stories"
              name="Stories"
              fill="var(--color-bougainvillea)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
