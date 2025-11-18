import { PageHeader } from "@/components/ui/page-header";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for people content
export const revalidate = 7200;

export default function PeoplePage() {
  return (
    <div className="bg-background-secondary font-sans min-h-screen">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title="Historical Figures" subtitle="Coming Soon" />

        <div className="bg-sunny-yellow/10 border-sunny-yellow/20 mt-8 rounded-md border p-6 text-center">
          <QuestionMarkCircleIcon className="text-sunny-yellow mx-auto mb-4 h-12 w-12" />
          <p className="text-text-primary mb-2 text-lg font-medium">
            This page is being prepared for launch
          </p>
          <p className="text-text-secondary">
            We&apos;re working on bringing you comprehensive information about
            Brava&apos;s historical figures. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
