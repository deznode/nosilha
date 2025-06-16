import { SignupForm } from "@/components/auth/signup-form";
import { PageHeader } from "@/components/ui/page-header";

export default function SignupPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Create an Account"
          subtitle="Join the Nosilha.com community to contribute."
        />
        <div className="mt-12">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
