import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import {
  CameraIcon,
  DocumentTextIcon,
  MapIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function ContributePage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Contribute to Nos Ilha"
          subtitle="Help us build the most comprehensive guide to Brava Island by sharing your knowledge, photos, and experiences."
        />

        {/* Hero Section */}
        <section className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm">
          <div className="text-center">
            <HeartIcon className="text-ocean-blue mx-auto h-16 w-16" />
            <h2 className="text-text-primary mt-4 font-serif text-2xl font-bold">
              Together, We Build Something Beautiful
            </h2>
            <p className="text-text-secondary mt-4 text-lg">
              Nos Ilha is powered by community contributions. Every photo,
              story, and piece of information helps preserve and share the
              beauty of Brava Island.
            </p>
          </div>
        </section>

        {/* Contribution Types */}
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
            Ways to Contribute
          </h3>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Photo Contributions */}
            <div className="bg-background-primary rounded-lg p-6 shadow-sm">
              <CameraIcon className="text-ocean-blue mb-4 h-10 w-10" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Share Your Photos
              </h4>
              <p className="text-text-secondary mb-4">
                Help us showcase the beauty of Brava by contributing your
                photographs of landscapes, businesses, landmarks, and cultural
                events.
              </p>
              <ul className="text-text-secondary mb-4 space-y-1 text-sm">
                <li>• High-resolution images preferred</li>
                <li>• Include location and date information</li>
                <li>• Respect privacy and property rights</li>
              </ul>
              <Link
                href="/add-entry"
                className="text-ocean-blue hover:text-ocean-blue/80 inline-flex items-center"
              >
                Start Contributing Photos →
              </Link>
            </div>

            {/* Information Updates */}
            <div className="bg-background-primary rounded-lg p-6 shadow-sm">
              <DocumentTextIcon className="text-valley-green mb-4 h-10 w-10" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Update Information
              </h4>
              <p className="text-text-secondary mb-4">
                Know about a new business, updated hours, or changes to a
                landmark? Help keep our directory accurate and current.
              </p>
              <ul className="text-text-secondary mb-4 space-y-1 text-sm">
                <li>• Business hours and contact info</li>
                <li>• New restaurants or accommodations</li>
                <li>• Seasonal closures or changes</li>
              </ul>
              <Link
                href="mailto:info@nosilha.com"
                className="text-valley-green hover:text-valley-green/80 inline-flex items-center"
              >
                Send Update →
              </Link>
            </div>

            {/* Local Stories */}
            <div className="bg-background-primary rounded-lg p-6 shadow-sm">
              <MapIcon className="text-bougainvillea-pink mb-4 h-10 w-10" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Share Local Stories
              </h4>
              <p className="text-text-secondary mb-4">
                Contribute historical information, cultural insights, or
                personal stories that help visitors understand Brava's rich
                heritage.
              </p>
              <ul className="text-text-secondary mb-4 space-y-1 text-sm">
                <li>• Historical accounts and legends</li>
                <li>• Cultural traditions and customs</li>
                <li>• Personal experiences and tips</li>
              </ul>
              <Link
                href="/history"
                className="text-bougainvillea-pink hover:text-bougainvillea-pink/80 inline-flex items-center"
              >
                Explore Stories →
              </Link>
            </div>
          </div>
        </section>

        {/* Guidelines Section */}
        <section className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            Contribution Guidelines
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Photo Guidelines
              </h4>
              <ul className="text-text-secondary space-y-2">
                <li>• Submit only your original photographs</li>
                <li>• Ensure images are clear and well-lit</li>
                <li>• Include accurate location information</li>
                <li>• Respect private property and people's privacy</li>
                <li>• Avoid overly commercial or promotional content</li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Information Standards
              </h4>
              <ul className="text-text-secondary space-y-2">
                <li>• Provide accurate and up-to-date information</li>
                <li>• Include reliable sources when possible</li>
                <li>• Be respectful of local culture and traditions</li>
                <li>• Write in clear, helpful language</li>
                <li>• Avoid biased or promotional language</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-16 text-center">
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Have Questions?
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            We're here to help you contribute to the Nos Ilha community.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="mailto:info@nosilha.com"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Back to Home
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
    title: "Contribute to Nos Ilha | Help Build Our Community Guide",
    description:
      "Help us build the most comprehensive guide to Brava Island by sharing your knowledge, photos, and experiences with the Nos Ilha community.",
    openGraph: {
      title: "Contribute to Nos Ilha",
      description:
        "Share your photos, stories, and knowledge to help preserve and showcase the beauty of Brava Island.",
      images: ["/images/contribute/community-hero.jpg"],
    },
  };
}
