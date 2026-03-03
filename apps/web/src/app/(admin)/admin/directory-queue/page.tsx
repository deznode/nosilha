import type { Metadata } from "next";
import { DirectoryQueue } from "@/components/admin/queues";

export const metadata: Metadata = {
  title: "Directory Queue | Admin",
  description: "Review and manage directory entry submissions",
};

export default function DirectoryQueuePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-body text-2xl font-bold">Directory Queue</h1>
        <p className="text-muted mt-1 text-sm">
          Review, edit, and moderate directory entry submissions
        </p>
      </div>
      <DirectoryQueue />
    </div>
  );
}
