import type { Metadata } from "next";
import { AiDashboardPanel } from "@/components/admin/ai-dashboard/ai-dashboard-panel";

export const metadata: Metadata = {
  title: "AI Dashboard | Admin",
  description: "Monitor AI providers, usage, and manage domain feature toggles",
};

export default function AiDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-body text-2xl font-bold">AI Dashboard</h1>
        <p className="text-muted mt-1 text-sm">
          Monitor AI providers, usage stats, and manage domain-level feature
          toggles
        </p>
      </div>
      <AiDashboardPanel />
    </div>
  );
}
