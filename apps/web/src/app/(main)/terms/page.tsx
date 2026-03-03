import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import {
  FileText,
  Users,
  AlertTriangle,
  Calendar,
  Scale,
  ShieldCheck,
} from "lucide-react";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Community Guidelines"
          subtitle="Welcome to our community dedicated to preserving and celebrating Brava Island's cultural heritage. These guidelines help us create a respectful and welcoming space for everyone who shares our passion for the island's history and traditions."
        />

        {/* Last Updated */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-6">
          <div className="flex items-center justify-center text-center">
            <Calendar className="text-ocean-blue mr-2 h-6 w-6" />
            <span className="text-text-secondary">
              <strong>Last Updated:</strong>{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </section>

        {/* Introduction */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <div className="mb-4 flex items-start">
            <FileText className="text-ocean-blue mt-1 mr-3 h-8 w-8" />
            <div>
              <h2 className="text-text-primary mb-4 font-serif text-2xl font-bold">
                Welcome to Our Cultural Heritage Community
              </h2>
              <p className="text-text-secondary mb-4 text-lg">
                Nos Ilha is more than just a website—it&apos;s a labor of love
                created by volunteers who are passionate about preserving and
                sharing the remarkable cultural heritage of Brava Island, Cape
                Verde. Our mission is to create a digital home where the
                stories, traditions, and beauty of our beloved &ldquo;Ilha das
                Flores&rdquo; can be celebrated and passed down to future
                generations.
              </p>
              <p className="text-text-secondary">
                These community guidelines help us maintain a space that honors
                our shared values of respect, authenticity, and cultural
                preservation. By participating in our community, you&apos;re
                helping us keep Brava&apos;s heritage alive for the world to
                discover.
              </p>
            </div>
          </div>
        </section>

        {/* Acceptance and Community Guidelines */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            1. Welcome to Our Community
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                1.1 Joining Our Community
              </h4>
              <p className="text-text-secondary">
                By exploring Nos Ilha, you&apos;re joining a community dedicated
                to celebrating and preserving Brava Island&apos;s rich cultural
                heritage. Using our platform means you agree to these community
                guidelines and our Privacy Policy.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                1.2 Respectful Participation
              </h4>
              <p className="text-text-secondary">
                We welcome everyone who shares our passion for Brava&apos;s
                culture and heritage. By participating, you agree to engage
                respectfully and follow applicable laws in your use of our
                platform.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Description */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            2. Platform Description
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                2.1 Our Mission
              </h4>
              <p className="text-text-secondary">
                Nos Ilha is a volunteer-driven, open-source platform that
                showcases the cultural heritage, natural beauty, and community
                spirit of Brava Island, Cape Verde.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                2.2 Platform Features
              </h4>
              <p className="text-text-secondary mb-2">Our platform includes:</p>
              <ul className="text-text-secondary ml-4 space-y-1">
                <li>• Interactive maps and location services</li>
                <li>
                  • Directory of businesses, landmarks, and cultural sites
                </li>
                <li>• Photo galleries and cultural content</li>
                <li>• Historical information and stories</li>
                <li>• Community contribution features</li>
                <li>• User accounts and authentication</li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                2.3 Service Availability
              </h4>
              <p className="text-text-secondary">
                We strive to maintain continuous service availability but cannot
                guarantee uninterrupted access. We may temporarily suspend
                services for maintenance, updates, or technical issues.
              </p>
            </div>
          </div>
        </section>

        {/* User Accounts */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            3. User Accounts
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                3.1 Account Creation
              </h4>
              <p className="text-text-secondary">
                To access certain features, you may need to create an account.
                You must provide accurate, current, and complete information and
                keep your account information updated.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                3.2 Account Security
              </h4>
              <p className="text-text-secondary">
                You are responsible for maintaining the security of your account
                and password. You must immediately notify us of any unauthorized
                access or security breaches.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                3.3 Account Suspension
              </h4>
              <p className="text-text-secondary">
                We reserve the right to suspend or terminate accounts that
                violate these Terms, engage in harmful behavior, or compromise
                platform security.
              </p>
            </div>
          </div>
        </section>

        {/* Community Contributions */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <div className="mb-4 flex items-start">
            <Users className="text-valley-green mt-1 mr-3 h-8 w-8" />
            <div>
              <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
                4. Sharing Our Cultural Heritage
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    4.1 How to Contribute Meaningfully
                  </h4>
                  <p className="text-text-secondary mb-2">
                    We encourage you to share stories, photos, and memories that
                    celebrate Brava&apos;s heritage. Great contributions:
                  </p>
                  <ul className="text-text-secondary ml-4 space-y-1">
                    <li>
                      • Share authentic stories and accurate information about
                      the island
                    </li>
                    <li>
                      • Honor and respect Brava&apos;s cultural traditions and
                      values
                    </li>
                    <li>• Include only content you have permission to share</li>
                    <li>
                      • Help preserve our community&apos;s history for future
                      generations
                    </li>
                    <li>• Create a welcoming space for all who love Brava</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    4.2 Keeping Our Community Safe
                  </h4>
                  <p className="text-text-secondary mb-2">
                    To maintain a respectful environment for everyone, please
                    avoid:
                  </p>
                  <ul className="text-text-secondary ml-4 space-y-1">
                    <li>
                      • Sharing inaccurate or misleading information about our
                      community
                    </li>
                    <li>
                      • Content that disrespects our culture or hurts community
                      members
                    </li>
                    <li>• Unwanted promotional or commercial content</li>
                    <li>• Technical disruption of our platform</li>
                    <li>• Pretending to be someone you&apos;re not</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    4.3 Sharing Your Stories
                  </h4>
                  <p className="text-text-secondary">
                    When you share content with us, you keep ownership of your
                    stories and photos. You&apos;re giving us permission to
                    display and share your contributions on our platform to help
                    preserve and celebrate Brava&apos;s cultural heritage
                    together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            5. Intellectual Property
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                5.1 Platform Content
              </h4>
              <p className="text-text-secondary">
                The Nos Ilha platform, including its design, features, and
                original content, is owned by Nos Ilha and protected by
                intellectual property laws.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                5.2 Open Source Code
              </h4>
              <p className="text-text-secondary">
                Our platform code is open source and available under the MIT
                License. You may use, modify, and distribute the code according
                to the license terms.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                5.3 Third-Party Content
              </h4>
              <p className="text-text-secondary">
                We respect the intellectual property rights of others and expect
                users to do the same. If you believe your rights have been
                violated, please contact us immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy and Data Protection */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <div className="mb-4 flex items-start">
            <ShieldCheck className="text-bougainvillea-pink mt-1 mr-3 h-8 w-8" />
            <div>
              <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
                6. Privacy and Data Protection
              </h3>
              <p className="text-text-secondary mb-4">
                Your privacy is important to us. Our collection, use, and
                protection of personal information is governed by our Privacy
                Policy, which forms part of these Terms.
              </p>
              <p className="text-text-secondary">
                By using our services, you consent to the collection and use of
                your information as described in our Privacy Policy.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notices */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <div className="mb-4 flex items-start">
            <AlertTriangle className="text-sobrado-ochre mt-1 mr-3 h-8 w-8" />
            <div>
              <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
                7. Important Things to Know
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    7.1 About Our Content
                  </h4>
                  <p className="text-text-secondary">
                    While we work hard to provide accurate information about
                    Brava Island, we&apos;re a volunteer-driven community
                    platform. We cannot guarantee that all information is
                    complete or error-free, so please use your best judgment.
                  </p>
                </div>

                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    7.2 Our Responsibility
                  </h4>
                  <p className="text-text-secondary">
                    As a community heritage project, we provide this platform
                    &ldquo;as is&rdquo; and do our best to keep it running
                    smoothly. However, we cannot be responsible for any problems
                    that might arise from using our services.
                  </p>
                </div>

                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    7.3 External Links
                  </h4>
                  <p className="text-text-secondary">
                    Sometimes we link to other websites that we think
                    you&apos;ll find interesting. We&apos;re not responsible for
                    what happens on those other sites - each has its own rules
                    and policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Management */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            8. Account Management
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                8.1 Managing Your Account
              </h4>
              <p className="text-text-secondary">
                You&apos;re always free to leave our community at any time by
                contacting us or using our account deletion features. We&apos;ll
                be sad to see you go, but we respect your choice.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                8.2 Community Standards
              </h4>
              <p className="text-text-secondary">
                If someone&apos;s behavior goes against our community spirit or
                these guidelines, we may need to temporarily restrict or remove
                their access to keep our platform safe and welcoming for
                everyone who loves Brava&apos;s heritage.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                8.3 Moving Forward
              </h4>
              <p className="text-text-secondary">
                If you decide to leave or if we need to restrict access, the
                basic protections around content and community standards will
                continue to apply to maintain the integrity of our cultural
                heritage platform.
              </p>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            9. Changes to These Terms
          </h3>

          <div className="space-y-4">
            <p className="text-text-secondary">
              We may update these Terms from time to time to reflect changes in
              our services, legal requirements, or business practices. When we
              make material changes, we will:
            </p>

            <ul className="text-text-secondary ml-4 space-y-2">
              <li>• Update the "Last Updated" date</li>
              <li>• Provide notice through our platform or email</li>
              <li>• Give you reasonable time to review the changes</li>
              <li>• Highlight significant modifications</li>
            </ul>

            <p className="text-text-secondary">
              Your continued use of our services after changes become effective
              constitutes acceptance of the updated Terms.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="bg-background-primary border-border-primary rounded-card shadow-subtle mt-16 border p-8">
          <div className="mb-4 flex items-start">
            <Scale className="text-text-secondary mt-1 mr-3 h-8 w-8" />
            <div>
              <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
                10. Governing Law and Disputes
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    10.1 Governing Law
                  </h4>
                  <p className="text-text-secondary">
                    These Terms are governed by the laws of Cape Verde, without
                    regard to conflict of law principles.
                  </p>
                </div>

                <div>
                  <h4 className="text-text-primary mb-2 text-lg font-semibold">
                    10.2 Dispute Resolution
                  </h4>
                  <p className="text-text-secondary">
                    We encourage resolving disputes through direct
                    communication. If formal resolution is needed, disputes will
                    be handled through the appropriate courts in Cape Verde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="from-ocean-blue/10 to-valley-green/10 rounded-card mt-16 bg-linear-to-r p-8">
          <div className="text-center">
            <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
              Questions About Our Community?
            </h3>
            <p className="text-text-secondary mb-6 text-lg">
              We&apos;re here to help! If you have any questions about our
              community guidelines or need assistance, please use our{" "}
              <Link
                href="/contact"
                className="text-ocean-blue font-medium hover:underline"
              >
                contact form
              </Link>{" "}
              to reach us.
            </p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-16 text-center">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            Related Information
          </h3>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/privacy"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button shadow-lift px-6 py-3 text-base font-semibold text-white transition-transform duration-300 hover:scale-105"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-button border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Contact Us
            </Link>
            <Link
              href="/about"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-button border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              About Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "Community Guidelines | Nos Ilha",
    description:
      "Join our community dedicated to preserving Brava Island's cultural heritage. Read our welcoming guidelines for sharing stories, photos, and celebrating our island's traditions together.",
    openGraph: {
      title: "Community Guidelines - Nos Ilha",
      description:
        "Community guidelines for the Nos Ilha platform, celebrating Brava Island's cultural heritage through respectful participation and shared passion.",
      images: ["/images/terms/community-guidelines.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
