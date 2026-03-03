import type { Metadata } from "next";
import { StoriesQueue } from "@/components/admin/queues";

export const metadata: Metadata = {
  title: "Stories | Admin",
  description: "Review, moderate, and publish community stories",
};

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-body text-2xl font-bold">Stories</h1>
        <p className="text-muted mt-1 text-sm">
          Review, moderate, and publish community-submitted stories
        </p>
      </div>
      <StoriesQueue />
    </div>
  );
}
