"use client";

import { useState } from "react";
import { Users } from "lucide-react";

/**
 * NewsletterCtaSection - Join the community CTA
 *
 * Full-width blue section with newsletter signup form.
 */
export function NewsletterCtaSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Simulate API call - replace with actual newsletter signup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Thank you for subscribing!" });
      setEmail("");
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-ocean-blue-deep relative overflow-hidden py-24 text-white">
      <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
        {/* Icon */}
        <div className="text-bougainvillea-pink mb-6 inline-block rounded-full bg-white/10 p-4 backdrop-blur-md">
          <Users size={32} />
        </div>

        {/* Heading */}
        <h2 className="mb-6 font-serif text-4xl font-bold text-white md:text-5xl">
          Join the Brava Community
        </h2>

        {/* Description */}
        <p className="mb-10 text-lg leading-relaxed text-white/90">
          Join our community of storytellers. Stay connected with updates or
          find out how you can contribute photos and stories to the archive.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="focus:ring-bougainvillea-pink flex-grow rounded-lg border border-white/30 bg-white/10 px-6 py-4 text-white placeholder-white/70 backdrop-blur-sm transition-all focus:bg-white/20 focus:ring-2 focus:outline-none disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-bougainvillea-pink rounded-lg px-8 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              message.type === "success" ? "text-green-300" : "text-red-300"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Privacy note */}
        <p className="mt-6 text-xs text-white/60">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
