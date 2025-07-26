import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon, 
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  CameraIcon,
  MapIcon
} from "@heroicons/react/24/outline";

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
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Get in Touch
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* General Inquiries */}
            <div className="bg-background-primary p-6 rounded-lg shadow-sm text-center">
              <EnvelopeIcon className="h-12 w-12 text-ocean-blue mx-auto mb-4" />
              <h4 className="font-semibold text-lg text-text-primary mb-2">
                General Inquiries
              </h4>
              <p className="text-text-secondary mb-4">
                Questions about the platform, partnerships, or general information.
              </p>
              <a
                href="mailto:info@nosilha.com"
                className="inline-flex items-center text-ocean-blue hover:text-ocean-blue/80 font-medium"
              >
                info@nosilha.com
              </a>
            </div>

            {/* Content & Contributions */}
            <div className="bg-background-primary p-6 rounded-lg shadow-sm text-center">
              <CameraIcon className="h-12 w-12 text-valley-green mx-auto mb-4" />
              <h4 className="font-semibold text-lg text-text-primary mb-2">
                Content & Contributions
              </h4>
              <p className="text-text-secondary mb-4">
                Share photos, stories, or information about Brava Island.
              </p>
              <a
                href="mailto:contribute@nosilha.com"
                className="inline-flex items-center text-valley-green hover:text-valley-green/80 font-medium"
              >
                contribute@nosilha.com
              </a>
            </div>

            {/* Technical Support */}
            <div className="bg-background-primary p-6 rounded-lg shadow-sm text-center">
              <CodeBracketIcon className="h-12 w-12 text-bougainvillea-pink mx-auto mb-4" />
              <h4 className="font-semibold text-lg text-text-primary mb-2">
                Technical Support
              </h4>
              <p className="text-text-secondary mb-4">
                Development questions, bug reports, or technical collaboration.
              </p>
              <a
                href="mailto:dev@nosilha.com"
                className="inline-flex items-center text-bougainvillea-pink hover:text-bougainvillea-pink/80 font-medium"
              >
                dev@nosilha.com
              </a>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6 text-center">
            Send Us a Message
          </h3>
          
          <form className="max-w-2xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-border-primary rounded-md focus:ring-2 focus:ring-ocean-blue focus:border-ocean-blue"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-border-primary rounded-md focus:ring-2 focus:ring-ocean-blue focus:border-ocean-blue"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full px-4 py-3 border border-border-primary rounded-md focus:ring-2 focus:ring-ocean-blue focus:border-ocean-blue"
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
              <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-4 py-3 border border-border-primary rounded-md focus:ring-2 focus:ring-ocean-blue focus:border-ocean-blue"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>
            
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="rounded-md bg-ocean-blue px-8 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
              >
                Send Message
              </button>
            </div>
          </form>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Frequently Asked Questions
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-background-primary p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-3">
                <QuestionMarkCircleIcon className="h-6 w-6 text-ocean-blue mr-3 mt-0.5" />
                <h4 className="font-semibold text-text-primary">
                  How can I add my business to the directory?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Visit our <Link href="/contribute" className="text-ocean-blue hover:underline">contribute page</Link> or 
                use the <Link href="/add-entry" className="text-ocean-blue hover:underline">add entry form</Link> to 
                submit your business information. Our team will review and publish it.
              </p>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-3">
                <QuestionMarkCircleIcon className="h-6 w-6 text-valley-green mr-3 mt-0.5" />
                <h4 className="font-semibold text-text-primary">
                  Can I contribute photos of Brava Island?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Absolutely! We welcome photo contributions from community members. 
                Please ensure you have permission to share the images and include 
                location information when possible.
              </p>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-3">
                <QuestionMarkCircleIcon className="h-6 w-6 text-bougainvillea-pink mr-3 mt-0.5" />
                <h4 className="font-semibold text-text-primary">
                  Is the platform available in other languages?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Currently, the platform is available in English, but we're planning 
                to add Portuguese and Kriolu support in the future. If you'd like to 
                help with translation, please contact us.
              </p>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-3">
                <QuestionMarkCircleIcon className="h-6 w-6 text-sunny-yellow mr-3 mt-0.5" />
                <h4 className="font-semibold text-text-primary">
                  How can I get involved in development?
                </h4>
              </div>
              <p className="text-text-secondary ml-9">
                Nos Ilha is an open-source project! Check out our GitHub repository 
                or contact our development team to learn about contributing to the codebase.
              </p>
            </div>
          </div>
        </section>

        {/* Community Links */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Join Our Community
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Connect with other Brava Island enthusiasts and stay updated on platform developments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contribute"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Contribute Content
            </Link>
            <Link
              href="/about"
              className="rounded-md border-2 border-valley-green px-6 py-3 text-base font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              Learn More About Us
            </Link>
          </div>
        </section>

        {/* Response Time Notice */}
        <section className="mt-16 bg-background-primary p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-ocean-blue mr-3" />
            <div>
              <h4 className="font-semibold text-text-primary">Response Time</h4>
              <p className="text-text-secondary">
                We typically respond to inquiries within 24-48 hours. Thank you for your patience!
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
    title: 'Contact Us | Nos Ilha - Get in Touch',
    description: 'Contact the Nos Ilha team for inquiries, contributions, technical support, or to learn more about our community-driven platform for Brava Island.',
    openGraph: {
      title: 'Contact Nos Ilha',
      description: 'Get in touch with the Nos Ilha community for support, contributions, or general inquiries about Brava Island.',
      images: ['/images/contact/contact-hero.jpg'],
    },
  };
}