import { AddEntryForm } from "@/components/admin/add-entry-form";
import { PageHeader } from "@/components/ui/page-header";

export default function AddEntryPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Add New Directory Entry"
          subtitle="Fill out the form below to add a new location to the Nosilha.com database."
        />
        <div className="mt-12">
          <AddEntryForm />
        </div>
      </div>
    </div>
  );
}
