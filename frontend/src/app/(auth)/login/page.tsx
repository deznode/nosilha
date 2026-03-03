import { LoginForm } from "@/components/auth/login-form";
import { PageHeader } from "@/components/ui/page-header";

export default function LoginPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Log In"
          subtitle="Welcome back. Access your account to manage your contributions."
        />
        <div className="mt-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
