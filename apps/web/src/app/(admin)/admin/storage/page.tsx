import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { R2StoragePanel } from "@/components/admin/r2-storage/r2-storage-panel";

export default function StoragePage() {
  return (
    <div className="bg-canvas min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <PageHeader
          title="Storage Management"
          subtitle="Browse, upload, and manage files in R2 object storage"
        />

        <R2StoragePanel />
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "Storage Management | Admin",
    description:
      "Manage R2 object storage — browse, upload, and scan for orphans",
  };
}
