import type { Metadata } from "next";
import { SuggestionsQueue } from "@/components/admin/queues";

export const metadata: Metadata = {
  title: "Suggestions | Admin",
  description: "Review and manage community suggestions",
};

export default function SuggestionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-body text-2xl font-bold">Suggestions</h1>
        <p className="text-muted mt-1 text-sm">
          Review and manage community suggestions for new directory entries
        </p>
      </div>
      <SuggestionsQueue />
    </div>
  );
}
