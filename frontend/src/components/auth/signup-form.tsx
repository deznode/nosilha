"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label } from "@/components/catalyst-ui/fieldset";
import { Alert } from "@/components/catalyst-ui/alert";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setEmail("");
      setPassword("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-md">
      {success ? (
        <Alert color="green" onClose={() => setSuccess(false)}>
          Check your email for the confirmation link!
        </Alert>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-6">
          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Field>

          {error && (
            <Alert color="red" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              className="bg-ocean-blue w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
