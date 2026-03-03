import type { Metadata } from "next";
import { MessagesQueue } from "@/components/admin/queues";

export const metadata: Metadata = {
  title: "Inquiries | Admin",
  description: "Review and manage contact messages and inquiries",
};

export default function InquiriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-body text-2xl font-bold">Inquiries</h1>
        <p className="text-muted mt-1 text-sm">
          Review and manage contact messages from the community
        </p>
      </div>
      <MessagesQueue />
    </div>
  );
}
