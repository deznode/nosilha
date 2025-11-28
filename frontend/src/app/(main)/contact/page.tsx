import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Mail, MessageSquare, HelpCircle, Code, Camera } from "lucide-react";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function ContactPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Contact Us"
          subtitle="Get in touch with the Nos Ilha community. We're here to help and would love to hear from you."
        />

        {/* Contact Methods */}
        {/* TODO: Verify that these email addresses are set up and monitored:
             - info@nosilha.com
             - contribute@nosilha.com  
             - dev@nosilha.com */}
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
            Get in Touch
          </h3>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* General Inquiries */}
            <div className="bg-background-primary border-border-primary rounded-xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <Mail className="text-ocean-blue mx-auto mb-4 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                General Inquiries
              </h4>
              <p className="text-text-secondary mb-4">
                Questions about the platform, partnerships, or general
                information.
              </p>
              <a
                href="mailto:info@nosilha.com"
                className="text-ocean-blue hover:text-ocean-blue/80 inline-flex items-center font-medium"
              >
                info@nosilha.com
              </a>
            </div>

            {/* Content & Contributions */}
            <div className="bg-background-primary border-border-primary rounded-xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <Camera className="text-valley-green mx-auto mb-4 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Content & Contributions
              </h4>
              <p className="text-text-secondary mb-4">
                Share photos, stories, or information about Brava Island.
              </p>
              <a
                href="mailto:contribute@nosilha.com"
                className="text-valley-green hover:text-valley-green/80 inline-flex items-center font-medium"
              >
                contribute@nosilha.com
              </a>
            </div>

            {/* Technical Support */}
            <div className="bg-background-primary border-border-primary rounded-xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <Code className="text-bougainvillea-pink mx-auto mb-4 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Technical Support
              </h4>
              <p className="text-text-secondary mb-4">
                Development questions, bug reports, or technical collaboration.
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:dev@nosilha.com"
                  className="text-bougainvillea-pink hover:text-bougainvillea-pink/80 block font-medium"
                >
                  dev@nosilha.com
                </a>
                <a
                  href="https://github.com/bravdigital/nosilha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bougainvillea-pink hover:text-bougainvillea-pink/80 block text-sm font-medium"
                >
                  GitHub Repository →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm">
          <h3 className="text-text-primary mb-6 text-center font-serif text-2xl font-bold">
            Send Us a Message
          </h3>

          {/* Form Notice */}
          <div className="bg-sunny-yellow/10 border-sunny-yellow/20 mx-auto mb-6 max-w-2xl rounded-md border p-4">
            <div className="flex items-center">
              <HelpCircle className="text-sunny-yellow mr-3 h-6 w-6" />
              <div>
                <p className="text-text-primary text-sm font-medium">
                  Contact form coming soon!
                </p>
                <p className="text-text-secondary text-xs">
                  For now, please use the email addresses above to get in touch
                  with us directly.
                </p>
              </div>
            </div>
          </div>

          <form className="pointer-events-none mx-auto max-w-2xl opacity-50">
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
                  className="border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-ocean-blue focus:border-ocean-blue w-full rounded-md border px-4 py-3 transition-colors focus:ring-2"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="subject"
                className="text-text-primary mb-2 block text-sm font-medium"
              >
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-ocean-blue focus:border-ocean-blue w-full rounded-md border px-4 py-3 transition-colors focus:ring-2"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="content">Content Contribution</option>
                <option value="business">Business Listing</option>
                <option value="technical">Technical Support</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mt-6">
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
                className="border-border-primary bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-ocean-blue focus:border-ocean-blue w-full rounded-md border px-4 py-3 transition-colors focus:ring-2"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <div className="mt-6 text-center">
              <button
                type="submit"
                className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-8 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
            Frequently Asked Questions
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-ocean-blue mt-0.5 mr-3 h-6 w-6" />
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
            </div>

            <div className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-valley-green mt-0.5 mr-3 h-6 w-6" />
                <h4 className="text-text-primary font-semibold">
                  Can I contribute photos of Brava Island?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Yes! We especially welcome high-quality photos of landscapes,
                cultural events, local businesses, and daily life on Brava.
                Please ensure you own the photos or have permission to share
                them, include specific location details, and send them to{" "}
                <a
                  href="mailto:contribute@nosilha.com"
                  className="text-valley-green hover:underline"
                >
                  contribute@nosilha.com
                </a>{" "}
                with a brief description of what and where the photo was taken.
              </p>
            </div>

            <div className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-bougainvillea-pink mt-0.5 mr-3 h-6 w-6" />
                <h4 className="text-text-primary font-semibold">
                  Is the platform available in other languages?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Currently available in English only. We&apos;re actively
                planning Portuguese and Kriolu (Cape Verdean Crioulo) support
                for 2026. If you&apos;re fluent in these languages and
                interested in helping translate content, please email{" "}
                <a
                  href="mailto:contribute@nosilha.com"
                  className="text-bougainvillea-pink hover:underline"
                >
                  contribute@nosilha.com
                </a>{" "}
                with &quot;Translation Help&quot; in the subject line.
              </p>
            </div>

            <div className="bg-background-primary border-border-primary rounded-xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 flex items-start">
                <HelpCircle className="text-sunny-yellow mt-0.5 mr-3 h-6 w-6" />
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
                  className="text-sunny-yellow hover:underline"
                >
                  GitHub repository
                </a>{" "}
                to see current issues, contribution guidelines, and the tech
                stack (Next.js, React, Spring Boot, Kotlin). New developers can
                start with &quot;good first issue&quot; labels, or email{" "}
                <a
                  href="mailto:dev@nosilha.com"
                  className="text-sunny-yellow hover:underline"
                >
                  dev@nosilha.com
                </a>{" "}
                for guidance.
              </p>
            </div>
          </div>
        </section>

        {/* Community Links */}
        <section className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8 text-center">
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
        </section>

        {/* Response Time Notice */}
        <section className="bg-background-primary mt-16 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-center">
            <MessageSquare className="text-ocean-blue mr-3 h-8 w-8" />
            <div>
              <h4 className="text-text-primary font-semibold">Response Time</h4>
              <p className="text-text-secondary">
                We typically respond to inquiries within 24-48 hours. Thank you
                for your patience!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "Contact Us | Nos Ilha - Get in Touch",
    description:
      "Contact the Nos Ilha team for inquiries, contributions, technical support, or to learn more about our community-driven platform for Brava Island.",
    openGraph: {
      title: "Contact Nos Ilha",
      description:
        "Get in touch with the Nos Ilha community for support, contributions, or general inquiries about Brava Island.",
      images: ["/images/contact/contact-hero.jpg"],
    },
  };
}
