import { Suspense } from "react";
import NosIlhaAuth from "@/components/auth/auth-form";

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <NosIlhaAuth initialView="signup" />
    </Suspense>
  );
}
