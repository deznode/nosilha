import { Suspense } from "react";
import NosIlhaAuth from "@/components/auth/auth-form";

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-surface-alt border-t-body h-8 w-8 animate-spin rounded-full border-4" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <NosIlhaAuth initialView="login" />
    </Suspense>
  );
}
