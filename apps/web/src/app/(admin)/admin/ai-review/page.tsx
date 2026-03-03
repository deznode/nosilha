import type { Metadata } from "next";
import { AiReviewQueue } from "@/components/admin/queues";

export const metadata: Metadata = {
  title: "AI Review | Admin",
  description: "Review AI-generated analysis results for moderation",
};

export default function AiReviewPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-body text-2xl font-bold">AI Review</h1>
        <p className="text-muted mt-1 text-sm">
          Trigger AI analysis and review results for gallery media
        </p>
      </div>
      <AiReviewQueue />
    </div>
  );
}
