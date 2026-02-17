"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowLeft } from "lucide-react";
import NosIlhaAuth from "@/components/auth/auth-form";

export default function AuthDevPage() {
  const [view, setView] = useState<"login" | "signup">("login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Auth Form</h1>
      <p className="text-muted mb-8">
        NosIlhaAuth form with login/signup toggle and OAuth provider buttons.
      </p>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView("login")}
          className={clsx(
            "rounded-button px-4 py-2 text-sm font-medium transition-colors",
            view === "login"
              ? "bg-ocean-blue text-white"
              : "bg-surface-alt text-muted hover:text-body"
          )}
        >
          Login View
        </button>
        <button
          onClick={() => setView("signup")}
          className={clsx(
            "rounded-button px-4 py-2 text-sm font-medium transition-colors",
            view === "signup"
              ? "bg-ocean-blue text-white"
              : "bg-surface-alt text-muted hover:text-body"
          )}
        >
          Signup View
        </button>
      </div>

      <div className="mx-auto max-w-md">
        <Suspense fallback={null}>
          <NosIlhaAuth key={view} initialView={view} />
        </Suspense>
      </div>
    </div>
  );
}
