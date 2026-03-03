"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, CheckCircle, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { submitContactMessage } from "@/lib/api";
import type { ContactRequest, ContactSubject } from "@/types/contact";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactPageContent() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPrivacy) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Map form subject to ContactSubject enum
      const subjectMap: Record<string, ContactSubject> = {
        general: "GENERAL_INQUIRY",
        content: "CONTENT_SUGGESTION",
        technical: "TECHNICAL_ISSUE",
        partnership: "PARTNERSHIP",
      };

      const request: ContactRequest = {
        name: formData.name,
        email: formData.email,
        subjectCategory: subjectMap[formData.subject],
        message: formData.message,
      };

      const response = await submitContactMessage(request);

      setConfirmationMessage(response.message);
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        // Check for specific error messages from backend
        if (error.message.includes("exceeded the maximum number")) {
          setErrorMessage(
            "Too many submissions. Please wait an hour before trying again."
          );
        } else if (error.message.includes("Invalid contact form data")) {
          setErrorMessage(
            "Invalid form data. Please check your input and try again."
          );
        } else {
          setErrorMessage(
            "Failed to submit your message. Please try again later."
          );
        }
      } else {
        setErrorMessage(
          "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setAgreedToPrivacy(false);
    setIsSubmitted(false);
    setConfirmationMessage("");
    setErrorMessage("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Contact Us"
          subtitle="Get in touch with the Nos Ilha community. We're here to help and would love to hear from you."
        />

        {/* Contact Form - Ideate Style */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            {/* Blue Header Bar */}
            <div className="bg-[var(--color-ocean-blue)] px-6 py-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Send className="h-5 w-5" />
                Send us a Message
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-6 py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="bg-valley-green/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                  >
                    <CheckCircle className="text-valley-green h-10 w-10" />
                  </motion.div>
                  <h4 className="text-text-primary mb-2 font-serif text-2xl font-bold">
                    Obrigado!
                  </h4>
                  <p className="text-text-secondary mb-6 text-lg">
                    {confirmationMessage ||
                      "Thank you for your message. We'll get back to you within 24-48 hours."}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-2 font-medium transition-colors hover:text-white"
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 p-6"
                >
                  {/* Error Message Display */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
                    >
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </motion.div>
                  )}

                  {/* Name and Email Row */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="text-text-primary mb-2 block text-sm font-medium"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-ocean-blue focus:border-ocean-blue w-full rounded-md border px-4 py-3 transition-colors focus:ring-2"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="text-text-primary mb-2 block text-sm font-medium"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-ocean-blue focus:border-ocean-blue w-full rounded-md border px-4 py-3 transition-colors focus:ring-2"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="text-text-primary mb-2 block text-sm font-medium"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-ocean-blue focus:border-ocean-blue w-full rounded-md border px-4 py-3 transition-colors focus:ring-2"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="content">Content Suggestion</option>
                      <option value="technical">Technical Issue</option>
                      <option value="partnership">
                        Partnership Opportunity
                      </option>
                    </select>
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label
                      htmlFor="message"
                      className="text-text-primary mb-2 block text-sm font-medium"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-ocean-blue focus:border-ocean-blue w-full rounded-md border px-4 py-3 transition-colors focus:ring-2"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)]"
                    />
                    <label
                      htmlFor="privacy"
                      className="text-text-secondary text-sm"
                    >
                      I agree to the{" "}
                      <Link
                        href="/privacy"
                        className="text-[var(--color-ocean-blue)] hover:underline"
                      >
                        privacy policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      type="submit"
                      disabled={isSubmitting || !agreedToPrivacy}
                      className="bg-ocean-blue hover:bg-ocean-blue/90 disabled:bg-ocean-blue/50 inline-flex w-full items-center justify-center gap-2 rounded-md px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <section className="mt-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-text-primary mb-8 text-center font-serif text-2xl font-bold"
          >
            Frequently Asked Questions
          </motion.h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2"
          >
            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-ocean-blue mt-0.5 mr-3 h-6 w-6 shrink-0" />
                <h4 className="text-text-primary font-semibold">
                  How can I add my business to the directory?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Visit our{" "}
                <Link
                  href="/contribute"
                  className="text-ocean-blue hover:underline"
                >
                  contribute page
                </Link>{" "}
                for detailed instructions. We need your business name, location,
                contact details, description, and photos if possible. All
                submissions are reviewed by our volunteer team within 1-2 weeks
                to ensure accuracy and cultural authenticity.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-valley-green mt-0.5 mr-3 h-6 w-6 shrink-0" />
                <h4 className="text-text-primary font-semibold">
                  Can I contribute photos of Brava Island?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Yes! We especially welcome high-quality photos of landscapes,
                cultural events, local businesses, and daily life on Brava.
                Please ensure you own the photos or have permission to share
                them. Use the contact form above with &quot;Content
                Contribution&quot; selected to submit your photos with location
                details.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-bougainvillea-pink mt-0.5 mr-3 h-6 w-6 shrink-0" />
                <h4 className="text-text-primary font-semibold">
                  Is the platform available in other languages?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Currently available in English only. We&apos;re actively
                planning Portuguese and Kriolu (Cape Verdean Crioulo) support
                for 2026. If you&apos;re fluent in these languages and
                interested in helping translate content, use the contact form
                with &quot;Partnership Opportunity&quot; selected.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-sobrado-ochre mt-0.5 mr-3 h-6 w-6 shrink-0" />
                <h4 className="text-text-primary font-semibold">
                  How can I get involved in development?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Nos Ilha is fully open-source! Visit our{" "}
                <a
                  href="https://github.com/bravdigital/nosilha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sobrado-ochre hover:underline"
                >
                  GitHub repository
                </a>{" "}
                to see current issues, contribution guidelines, and the tech
                stack (Next.js, React, Spring Boot, Kotlin). New developers can
                start with &quot;good first issue&quot; labels, or use the
                contact form with &quot;Technical Support&quot; for guidance.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Community Links */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8 text-center"
        >
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Join Our Community
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            Connect with other Brava Island enthusiasts and stay updated on
            platform developments.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contribute"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Contribute Content
            </Link>
            <a
              href="https://github.com/bravdigital/nosilha"
              target="_blank"
              rel="noopener noreferrer"
              className="border-bougainvillea-pink text-bougainvillea-pink hover:bg-bougainvillea-pink rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              View on GitHub
            </a>
            <Link
              href="/about"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Learn More About Us
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
