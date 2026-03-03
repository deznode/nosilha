import { PageHeader } from "@/components/ui/page-header";
import { R2StoragePanel } from "@/components/admin/r2-storage/r2-storage-panel";

export default function StoragePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Storage Management"
        subtitle="Browse, upload, and manage files in R2 object storage"
      />

      <R2StoragePanel />
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
