"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { loginSchema, type LoginInput } from "@/schemas/authSchema";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label, ErrorMessage } from "@/components/catalyst-ui/fieldset";
import { NosilhaLogo } from "@/components/ui/logo";

// --- Types ---
type AuthView = "login" | "signup";
type OAuthProvider = "google" | "facebook";

interface NosIlhaAuthProps {
  initialView?: AuthView;
}

// --- Social Login Icons ---
const GoogleIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="h-5 w-5 text-[#1877F2]"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// --- Password Input with Show/Hide Toggle ---
function PasswordInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={error ? "border-status-error" : ""}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-basalt-500 hover:text-basalt-900 absolute top-1/2 right-3 -translate-y-1/2 transition-colors focus:outline-none dark:hover:text-white"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

// --- Main Auth Component ---
export default function NosIlhaAuth({
  initialView = "login",
}: NosIlhaAuthProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(initialView === "login");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Form setup with Zod validation (using loginSchema for both - email + password only)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const toggleMode = () => {
    setIsAnimating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    reset();
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  // --- OAuth Handler ---
  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      setErrorMsg(null);
      setIsOAuthLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : "OAuth login failed"
      );
      setIsOAuthLoading(false);
    }
  };

  // --- Form Submit Handler ---
  const onSubmit = async (data: LoginInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        // Redirect to the return URL or homepage on success
        const redirectTo = searchParams.get("returnUrl");
        // Validate redirect URL to prevent open redirect attacks
        // Only allow relative paths that start with /
        const safeRedirect =
          redirectTo &&
          redirectTo.startsWith("/") &&
          !redirectTo.startsWith("//")
            ? redirectTo
            : "/";
        router.push(safeRedirect);
        router.refresh();
      } else {
        // Signup
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        // Show success message
        setSuccessMsg("Check your email for the confirmation link!");
        reset();
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="bg-mist-50 dark:bg-bg-primary text-basalt-900 dark:text-text-primary relative flex min-h-screen w-full overflow-hidden font-sans transition-colors duration-500">
      {/* --- Atmospheric Background --- */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay dark:opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Animated Orbs */}
        <div className="bg-ocean-blue/10 dark:bg-ocean-blue/20 absolute top-[-10%] left-[-10%] h-125 w-125 animate-pulse rounded-full blur-3xl" />
        <div className="bg-valley-green/10 dark:bg-valley-green/20 absolute right-[-10%] bottom-[-10%] h-150 w-150 animate-pulse rounded-full blur-3xl [animation-delay:1s]" />
      </div>

      <div className="z-10 mx-auto flex w-full max-w-6xl items-center justify-center p-4 lg:p-8">
        {/* Card Container */}
        <div className="dark:bg-basalt-800 dark:shadow-ocean-blue/5 border-mist-200 dark:border-basalt-500 rounded-container shadow-floating grid min-h-150 w-full overflow-hidden border bg-white transition-colors duration-300 lg:grid-cols-2">
          {/* Left Panel: Brand (Hidden on mobile) */}
          <div className="bg-ocean-blue relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
            {/* Gradient Overlay for visual depth */}
            <div className="from-ocean-blue via-ocean-blue/90 to-basalt-900/80 absolute inset-0 bg-linear-to-b" />

            {/* Content */}
            <div className="relative z-10">
              <Link href="/" className="mb-8 inline-block">
                <NosilhaLogo
                  variant="light"
                  className="scale-90"
                  instanceId="auth-desktop"
                />
              </Link>

              <h1 className="mb-6 font-serif text-4xl leading-tight">
                {isLogin
                  ? "Welcome back to the soul of Brava."
                  : "Join the Nos Ilha Community."}
              </h1>
              <p className="text-mist-100/80 max-w-md text-lg leading-relaxed">
                {isLogin
                  ? "Access your account to manage your contributions and connect with the heritage."
                  : "Create an account to preserve the culture, share stories, and contribute."}
              </p>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="relative flex flex-col justify-center p-8 lg:p-12 xl:p-16">
            {/* Back Button - Inside form panel */}
            <button
              onClick={() => router.back()}
              className="text-basalt-500 hover:text-basalt-900 dark:text-mist-300 absolute top-4 left-4 flex items-center gap-1.5 text-sm font-medium transition-colors lg:top-6 lg:left-6 dark:hover:text-white"
              type="button"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {/* Mobile Header */}
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <Link href="/">
                <NosilhaLogo
                  showSubtitle
                  className="scale-75"
                  instanceId="auth-mobile"
                />
              </Link>
            </div>

            <motion.div
              className="transition-all duration-300 ease-in-out"
              animate={{
                opacity: isAnimating ? 0 : 1,
                y: isAnimating ? 16 : 0,
              }}
            >
              <div className="mb-8">
                <h2 className="text-text-primary mb-2 font-serif text-3xl font-bold">
                  {isLogin ? "Sign in" : "Create an account"}
                </h2>
                <p className="text-basalt-500 dark:text-mist-200">
                  {isLogin
                    ? "Enter your details to access your account"
                    : "Start your journey with us today"}
                </p>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-status-success/30 bg-status-success/10 text-status-success rounded-card mb-6 flex items-start border p-4 text-sm"
                  >
                    <AlertCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-status-error/30 bg-status-error/10 text-status-error rounded-card mb-6 flex items-start border p-4 text-sm"
                  >
                    <AlertCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Social Auth */}
              <div className="mb-8 grid grid-cols-2 gap-4">
                <Button
                  outline
                  onClick={() => handleSocialLogin("google")}
                  disabled={isOAuthLoading || isSubmitting}
                  className="flex w-full items-center justify-center gap-2"
                  type="button"
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  outline
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={isOAuthLoading || isSubmitting}
                  className="flex w-full items-center justify-center gap-2"
                  type="button"
                >
                  <FacebookIcon />
                  Facebook
                </Button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="border-mist-200 dark:border-basalt-500 w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="dark:bg-basalt-800 text-basalt-500 dark:text-mist-200 bg-white px-2">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Field>
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={errors.email ? "border-status-error" : ""}
                  />
                  {errors.email && (
                    <ErrorMessage>{errors.email.message}</ErrorMessage>
                  )}
                </Field>

                <Field>
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <PasswordInput
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                  {errors.password && (
                    <ErrorMessage>{errors.password.message}</ErrorMessage>
                  )}
                  {isLogin && (
                    <div className="mt-2 flex justify-end">
                      <a
                        href="/forgot-password"
                        className="text-ocean-blue hover:text-ocean-blue-light text-sm font-medium hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}
                </Field>

                <Button
                  type="submit"
                  color="blue"
                  disabled={isSubmitting || isOAuthLoading}
                  className="mt-6 w-full"
                >
                  {isSubmitting ? (
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      data-slot="icon"
                    />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight data-slot="icon" strokeWidth={2.5} />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Footer / Toggle */}
            <div className="mt-8 text-center">
              <p className="text-basalt-500 dark:text-mist-200">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  onClick={toggleMode}
                  className="text-ocean-blue hover:text-bougainvillea-pink font-medium transition-colors"
                  type="button"
                >
                  {isLogin ? "Sign up for free" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-basalt-500/50 dark:text-mist-200/50 absolute bottom-4 w-full text-center text-xs">
        <p>
          © {new Date().getFullYear()} Nos Ilha. Preserving culture through
          code.
        </p>
      </div>
    </div>
  );
}
