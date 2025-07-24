import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { 
  DocumentTextIcon, 
  UsersIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  ScaleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <div className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Terms of Service"
          subtitle="Please read these terms carefully before using the Nos Ilha platform. By using our services, you agree to be bound by these terms."
        />

        {/* Last Updated */}
        <section className="mt-16 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center text-center">
            <CalendarIcon className="h-6 w-6 text-ocean-blue mr-2" />
            <span className="text-volcanic-gray">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </section>

        {/* Introduction */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-start mb-4">
            <DocumentTextIcon className="h-8 w-8 text-ocean-blue mr-3 mt-1" />
            <div>
              <h2 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-4">
                Welcome to Nos Ilha
              </h2>
              <p className="text-lg text-volcanic-gray mb-4">
                These Terms of Service ("Terms") govern your use of the Nos Ilha platform, 
                website, and services. Nos Ilha is a community-driven platform celebrating 
                the cultural heritage and natural beauty of Brava Island, Cape Verde.
              </p>
              <p className="text-volcanic-gray">
                By accessing or using our platform, you agree to comply with and be bound 
                by these Terms. If you do not agree to these Terms, please do not use our services.
              </p>
            </div>
          </div>
        </section>

        {/* Acceptance and Eligibility */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            1. Acceptance and Eligibility
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                1.1 Agreement to Terms
              </h4>
              <p className="text-volcanic-gray">
                By using Nos Ilha, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                1.2 Age Requirements
              </h4>
              <p className="text-volcanic-gray">
                You must be at least 13 years old to use our services. If you are under 18, you must have parental consent to use our platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                1.3 Capacity to Enter Agreement
              </h4>
              <p className="text-volcanic-gray">
                You represent that you have the legal capacity to enter into these Terms and that your use of our services complies with applicable laws.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Description */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            2. Platform Description
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                2.1 Our Mission
              </h4>
              <p className="text-volcanic-gray">
                Nos Ilha is a volunteer-driven, open-source platform that showcases the cultural heritage, 
                natural beauty, and community spirit of Brava Island, Cape Verde.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                2.2 Platform Features
              </h4>
              <p className="text-volcanic-gray mb-2">Our platform includes:</p>
              <ul className="text-volcanic-gray space-y-1 ml-4">
                <li>• Interactive maps and location services</li>
                <li>• Directory of businesses, landmarks, and cultural sites</li>
                <li>• Photo galleries and cultural content</li>
                <li>• Historical information and stories</li>
                <li>• Community contribution features</li>
                <li>• User accounts and authentication</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                2.3 Service Availability
              </h4>
              <p className="text-volcanic-gray">
                We strive to maintain continuous service availability but cannot guarantee uninterrupted access. 
                We may temporarily suspend services for maintenance, updates, or technical issues.
              </p>
            </div>
          </div>
        </section>

        {/* User Accounts */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            3. User Accounts
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                3.1 Account Creation
              </h4>
              <p className="text-volcanic-gray">
                To access certain features, you may need to create an account. You must provide accurate, 
                current, and complete information and keep your account information updated.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                3.2 Account Security
              </h4>
              <p className="text-volcanic-gray">
                You are responsible for maintaining the security of your account and password. 
                You must immediately notify us of any unauthorized access or security breaches.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                3.3 Account Suspension
              </h4>
              <p className="text-volcanic-gray">
                We reserve the right to suspend or terminate accounts that violate these Terms, 
                engage in harmful behavior, or compromise platform security.
              </p>
            </div>
          </div>
        </section>

        {/* User Content and Conduct */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-start mb-4">
            <UsersIcon className="h-8 w-8 text-valley-green mr-3 mt-1" />
            <div>
              <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
                4. User Content and Conduct
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    4.1 Content Guidelines
                  </h4>
                  <p className="text-volcanic-gray mb-2">When contributing content, you must:</p>
                  <ul className="text-volcanic-gray space-y-1 ml-4">
                    <li>• Provide accurate and truthful information</li>
                    <li>• Respect intellectual property rights</li>
                    <li>• Only submit content you have permission to share</li>
                    <li>• Respect local culture and traditions</li>
                    <li>• Avoid offensive, discriminatory, or harmful content</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    4.2 Prohibited Conduct
                  </h4>
                  <p className="text-volcanic-gray mb-2">You may not:</p>
                  <ul className="text-volcanic-gray space-y-1 ml-4">
                    <li>• Post false, misleading, or defamatory content</li>
                    <li>• Harass, threaten, or intimidate other users</li>
                    <li>• Spam or engage in commercial solicitation</li>
                    <li>• Attempt to hack or disrupt our services</li>
                    <li>• Violate applicable laws or regulations</li>
                    <li>• Impersonate others or misrepresent your identity</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    4.3 Content Ownership and License
                  </h4>
                  <p className="text-volcanic-gray">
                    You retain ownership of content you submit but grant us a non-exclusive, 
                    royalty-free license to use, display, and distribute your content on our platform 
                    for the purpose of operating and promoting our services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            5. Intellectual Property
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                5.1 Platform Content
              </h4>
              <p className="text-volcanic-gray">
                The Nos Ilha platform, including its design, features, and original content, 
                is owned by Nos Ilha and protected by intellectual property laws.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                5.2 Open Source Code
              </h4>
              <p className="text-volcanic-gray">
                Our platform code is open source and available under the MIT License. 
                You may use, modify, and distribute the code according to the license terms.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                5.3 Third-Party Content
              </h4>
              <p className="text-volcanic-gray">
                We respect the intellectual property rights of others and expect users to do the same. 
                If you believe your rights have been violated, please contact us immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy and Data Protection */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-start mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-bougainvillea-pink mr-3 mt-1" />
            <div>
              <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-4">
                6. Privacy and Data Protection
              </h3>
              <p className="text-volcanic-gray mb-4">
                Your privacy is important to us. Our collection, use, and protection of personal 
                information is governed by our Privacy Policy, which forms part of these Terms.
              </p>
              <p className="text-volcanic-gray">
                By using our services, you consent to the collection and use of your information 
                as described in our Privacy Policy.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimers and Limitations */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-start mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-sunny-yellow mr-3 mt-1" />
            <div>
              <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
                7. Disclaimers and Limitations
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    7.1 Service Disclaimer
                  </h4>
                  <p className="text-volcanic-gray">
                    Our services are provided "as is" without warranties of any kind. 
                    We do not guarantee the accuracy, completeness, or reliability of content on our platform.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    7.2 Limitation of Liability
                  </h4>
                  <p className="text-volcanic-gray">
                    To the fullest extent permitted by law, Nos Ilha shall not be liable for any 
                    indirect, incidental, special, consequential, or punitive damages arising from 
                    your use of our services.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    7.3 Third-Party Services
                  </h4>
                  <p className="text-volcanic-gray">
                    Our platform may contain links to third-party websites or services. 
                    We are not responsible for the content, privacy policies, or practices of third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            8. Termination
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                8.1 Termination by You
              </h4>
              <p className="text-volcanic-gray">
                You may terminate your account at any time by contacting us or using account 
                deletion features. Upon termination, your access to the platform will cease.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                8.2 Termination by Us
              </h4>
              <p className="text-volcanic-gray">
                We may suspend or terminate your access to our services at any time, with or without 
                cause, including for violation of these Terms or harmful conduct.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                8.3 Effect of Termination
              </h4>
              <p className="text-volcanic-gray">
                Upon termination, your right to use our services will immediately cease. 
                Provisions that by their nature should survive termination will remain in effect.
              </p>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            9. Changes to These Terms
          </h3>
          
          <div className="space-y-4">
            <p className="text-volcanic-gray">
              We may update these Terms from time to time to reflect changes in our services, 
              legal requirements, or business practices. When we make material changes, we will:
            </p>
            
            <ul className="text-volcanic-gray space-y-2 ml-4">
              <li>• Update the "Last Updated" date</li>
              <li>• Provide notice through our platform or email</li>
              <li>• Give you reasonable time to review the changes</li>
              <li>• Highlight significant modifications</li>
            </ul>
            
            <p className="text-volcanic-gray">
              Your continued use of our services after changes become effective constitutes 
              acceptance of the updated Terms.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-start mb-4">
            <ScaleIcon className="h-8 w-8 text-volcanic-gray mr-3 mt-1" />
            <div>
              <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-4">
                10. Governing Law and Disputes
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    10.1 Governing Law
                  </h4>
                  <p className="text-volcanic-gray">
                    These Terms are governed by the laws of Cape Verde, without regard to conflict of law principles.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                    10.2 Dispute Resolution
                  </h4>
                  <p className="text-volcanic-gray">
                    We encourage resolving disputes through direct communication. If formal resolution 
                    is needed, disputes will be handled through the appropriate courts in Cape Verde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <div className="text-center">
            <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-4">
              Questions About These Terms?
            </h3>
            <p className="text-lg text-volcanic-gray mb-6">
              If you have questions about these Terms of Service, please contact us.
            </p>
            <div className="space-y-2">
              <p className="text-volcanic-gray">
                <strong>Email:</strong> legal@nosilha.com
              </p>
              <p className="text-volcanic-gray">
                <strong>General Contact:</strong> info@nosilha.com
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            Related Information
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/privacy"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="rounded-md border-2 border-valley-green px-6 py-3 text-base font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              Contact Us
            </Link>
            <Link
              href="/about"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
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
    title: 'Terms of Service | Nos Ilha',
    description: 'Read the Terms of Service for Nos Ilha, including user guidelines, content policies, and platform rules for our community-driven platform.',
    openGraph: {
      title: 'Terms of Service - Nos Ilha',
      description: 'Terms of Service for the Nos Ilha platform, outlining user rights, responsibilities, and community guidelines.',
      images: ['/images/terms/terms-of-service.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}