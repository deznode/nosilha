"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label } from "@/components/catalyst-ui/fieldset";
import { Alert } from "@/components/catalyst-ui/alert";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      // On successful login, redirect to the homepage.
      // Supabase client handles setting the session cookie automatically.
      router.push("/");
      router.refresh(); // Refresh to update server-side session state
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={handleLogin} className="space-y-6">
        <Field>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        {error && <Alert color="red" onClose={() => setError(null)}>{error}</Alert>}

        <div>
          <Button
            type="submit"
            className="w-full bg-ocean-blue"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </Button>
        </div>
      </form>
    </div>
  );
}
