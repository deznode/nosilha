import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  ServerIcon,
  EnvelopeIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Privacy Policy"
          subtitle="Our commitment to protecting your privacy while preserving and celebrating Brava Island's cultural heritage together."
        />

        {/* Last Updated */}
        <section className="mt-16 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
          <div className="flex items-center justify-center text-center">
            <CalendarIcon className="h-6 w-6 text-ocean-blue mr-2" />
            <span className="text-text-secondary">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </section>

        {/* Introduction */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="flex items-start mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-ocean-blue mr-3 mt-1" />
            <div>
              <h2 className="font-serif text-2xl font-bold text-text-primary mb-4">
                Our Commitment to You and Brava&apos;s Heritage
              </h2>
              <p className="text-lg text-text-secondary mb-4">
                Nos Ilha is more than a website—it&apos;s a labor of love created by volunteers 
                passionate about preserving Brava Island&apos;s rich cultural heritage. We&apos;re 
                committed to protecting your privacy with the same care and respect we show 
                for our island&apos;s traditions, stories, and community bonds.
              </p>
              <p className="text-text-secondary mb-4">
                As a community-driven, volunteer-supported platform, we collect only the minimal 
                information needed to help preserve and share Brava&apos;s cultural treasures, 
                connect diaspora communities, and support local businesses and landmarks.
              </p>
              <p className="text-text-secondary">
                This privacy policy explains how we handle your information with the respect 
                and transparency that our community deserves.
              </p>
            </div>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Information We Collect
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                1. Information You Provide
              </h4>
              <ul className="space-y-2 text-text-secondary ml-4">
                <li>• Account registration information (name, email address)</li>
                <li>• Cultural content you share (stories about Brava, photos, business information, historical memories)</li>
                <li>• Support requests and inquiries you send us</li>
                <li>• User preferences and settings</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                2. Information We Collect Automatically
              </h4>
              <ul className="space-y-2 text-text-secondary ml-4">
                <li>• Device information (browser type, operating system)</li>
                <li>• Usage data (pages visited, time spent, click patterns)</li>
                <li>• IP address and general location information</li>
                <li>• Log files and performance data</li>
                <li>• Cookies and similar tracking technologies</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                3. Information from Third Parties
              </h4>
              <ul className="space-y-2 text-text-secondary ml-4">
                <li>• Authentication data from Supabase (our authentication provider)</li>
                <li>• Analytics data for platform improvement (anonymized usage patterns)</li>
                <li>• Map data from Mapbox for location services</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            How We Use Your Information
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Preserving Cultural Heritage
              </h4>
              <ul className="space-y-2 text-text-secondary">
                <li>• Share and preserve stories about Brava Island</li>
                <li>• Display your cultural contributions to help others discover the island</li>
                <li>• Connect diaspora communities with their homeland</li>
                <li>• Support local businesses and cultural sites</li>
                <li>• Keep you informed about important updates</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Community Care & Protection
              </h4>
              <ul className="space-y-2 text-text-secondary">
                <li>• Improve the platform to better serve our community</li>
                <li>• Understand how people use the site to make it more helpful</li>
                <li>• Protect the community from spam and inappropriate content</li>
                <li>• Follow laws that help keep everyone safe</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Storage and Security */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="flex items-start mb-4">
            <ServerIcon className="h-8 w-8 text-valley-green mr-3 mt-1" />
            <div>
              <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
                Data Storage and Security
              </h3>
              <p className="text-text-secondary mb-4">
                We use industry-standard security measures to protect your personal information:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Data Storage</h4>
                  <ul className="text-text-secondary space-y-1 ml-4">
                    <li>• Data stored on secure Google Cloud Platform servers</li>
                    <li>• Regular backups and disaster recovery procedures</li>
                    <li>• Encryption in transit and at rest</li>
                    <li>• Access restricted to authorized personnel only</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Security Measures</h4>
                  <ul className="text-text-secondary space-y-1 ml-4">
                    <li>• SSL/TLS encryption for all data transmission</li>
                    <li>• Secure authentication through Supabase</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Limited data retention periods</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="flex items-start mb-4">
            <EyeIcon className="h-8 w-8 text-bougainvillea-pink mr-3 mt-1" />
            <div>
              <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
                Your Privacy Rights
              </h3>
              <p className="text-text-secondary mb-4">
                As a valued member of our community, you have full control over your personal information:
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Access & Control</h4>
                  <ul className="text-text-secondary space-y-1">
                    <li>• Access your personal data</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Delete your account and data</li>
                    <li>• Download your data</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Communication</h4>
                  <ul className="text-text-secondary space-y-1">
                    <li>• Limit data processing</li>
                    <li>• Object to certain uses</li>
                    <li>• File privacy complaints</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Cookies and Tracking Technologies
          </h3>
          
          <div className="space-y-4">
            <p className="text-text-secondary">
              We use simple cookies to make your visits to our cultural heritage platform more enjoyable:
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-background-tertiary p-4 rounded">
                <h4 className="font-semibold text-text-primary mb-2">Essential Cookies</h4>
                <p className="text-sm text-text-secondary">
                  Needed for the website to work properly and keep your account secure.
                </p>
              </div>
              
              <div className="bg-background-tertiary p-4 rounded">
                <h4 className="font-semibold text-text-primary mb-2">Analytics Cookies</h4>
                <p className="text-sm text-text-secondary">
                  Help us understand how to make the platform more useful for our community.
                </p>
              </div>
              
              <div className="bg-background-tertiary p-4 rounded">
                <h4 className="font-semibold text-text-primary mb-2">Preference Cookies</h4>
                <p className="text-sm text-text-secondary">
                  Remember your preferences so you feel at home when you visit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Third-Party Services
          </h3>
          
          <div className="space-y-4">
            <p className="text-text-secondary mb-4">
              We use the following third-party services that may collect information:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Authentication</h4>
                <p className="text-sm text-text-secondary mb-2">
                  <strong>Supabase:</strong> Handles user authentication and account management.
                </p>
                <Link href="https://supabase.com/privacy" className="text-xs text-ocean-blue hover:underline">
                  View Supabase Privacy Policy
                </Link>
              </div>
              
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Maps & Location</h4>
                <p className="text-sm text-text-secondary mb-2">
                  <strong>Mapbox:</strong> Provides interactive maps and location services.
                </p>
                <Link href="https://www.mapbox.com/privacy" className="text-xs text-ocean-blue hover:underline">
                  View Mapbox Privacy Policy
                </Link>
              </div>
              
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Cloud Storage</h4>
                <p className="text-sm text-text-secondary mb-2">
                  <strong>Google Cloud:</strong> Stores and processes platform data securely.
                </p>
                <Link href="https://cloud.google.com/privacy" className="text-xs text-ocean-blue hover:underline">
                  View Google Cloud Privacy Policy
                </Link>
              </div>
              
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Analytics</h4>
                <p className="text-sm text-text-secondary mb-2">
                  <strong>Privacy-Focused Analytics:</strong> We use minimal, anonymized analytics to understand how to better serve our community.
                </p>
                <p className="text-xs text-text-secondary">
                  Data is aggregated and cannot be traced to individual users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Data Retention
          </h3>
          
          <div className="space-y-4">
            <p className="text-text-secondary">
              We keep your information only as long as needed to preserve Brava&apos;s cultural heritage and serve our community:
            </p>
            
            <ul className="space-y-2 text-text-secondary ml-4">
              <li>• Account data: Kept while you&apos;re part of our community</li>
              <li>• Cultural contributions: Preserved to maintain our shared heritage</li>
              <li>• Technical data: Kept briefly for security and improvements</li>
              <li>• Usage insights: Made anonymous to protect individual privacy</li>
            </ul>
            
            <p className="text-text-secondary mt-4">
              If you decide to leave our community, we&apos;ll remove your personal information 
              promptly while preserving any cultural contributions you&apos;ve chosen to share 
              for the benefit of future generations learning about Brava.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        {/* TODO: Verify that privacy@nosilha.com is set up and monitored */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <div className="text-center">
            <EnvelopeIcon className="h-12 w-12 text-ocean-blue mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
              Questions About Privacy?
            </h3>
            <p className="text-lg text-text-secondary mb-6">
              If you have questions about this privacy policy or how we handle your data, 
              please contact us.
            </p>
            <div className="space-y-2">
              <p className="text-text-secondary">
                <strong>Email:</strong> privacy@nosilha.com
              </p>
              <p className="text-text-secondary">
                <strong>General Contact:</strong> info@nosilha.com
              </p>
            </div>
          </div>
        </section>

        {/* Policy Updates */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Policy Updates
          </h3>
          
          <div className="space-y-4">
            <p className="text-text-secondary">
              We may update this privacy policy from time to time to reflect changes in our 
              practices or applicable laws. When we make significant changes, we will:
            </p>
            
            <ul className="space-y-2 text-text-secondary ml-4">
              <li>• Update the &ldquo;Last Updated&rdquo; date at the top of this page</li>
              <li>• Notify users via email or platform notification</li>
              <li>• Provide a summary of key changes</li>
              <li>• Give you time to review before changes take effect</li>
            </ul>
            
            <p className="text-text-secondary">
              Your continued use of our platform after policy updates constitutes acceptance 
              of the new terms.
            </p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Related Information
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/terms"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Terms of Service
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
    title: 'Privacy Policy | Nos Ilha',
    description: 'Learn how Nos Ilha collects, uses, and protects your personal information. Our privacy policy explains our commitment to data protection and user rights.',
    openGraph: {
      title: 'Privacy Policy - Nos Ilha',
      description: 'Our privacy policy explains how we collect, use, and protect your personal information on the Nos Ilha platform.',
      images: ['/images/privacy/privacy-policy.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}