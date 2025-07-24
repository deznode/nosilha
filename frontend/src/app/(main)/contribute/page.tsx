import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { 
  CameraIcon, 
  DocumentTextIcon, 
  MapIcon,
  HeartIcon 
} from "@heroicons/react/24/outline";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function ContributePage() {
  return (
    <div className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Contribute to Nos Ilha"
          subtitle="Help us build the most comprehensive guide to Brava Island by sharing your knowledge, photos, and experiences."
        />

        {/* Hero Section */}
        <section className="mt-16 rounded-lg bg-white p-8 shadow-sm">
          <div className="text-center">
            <HeartIcon className="mx-auto h-16 w-16 text-ocean-blue" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-volcanic-gray-dark">
              Together, We Build Something Beautiful
            </h2>
            <p className="mt-4 text-lg text-volcanic-gray">
              Nos Ilha is powered by community contributions. Every photo, story, 
              and piece of information helps preserve and share the beauty of Brava Island.
            </p>
          </div>
        </section>

        {/* Contribution Types */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-8">
            Ways to Contribute
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Photo Contributions */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CameraIcon className="h-10 w-10 text-ocean-blue mb-4" />
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                Share Your Photos
              </h4>
              <p className="text-volcanic-gray mb-4">
                Help us showcase the beauty of Brava by contributing your photographs 
                of landscapes, businesses, landmarks, and cultural events.
              </p>
              <ul className="text-sm text-volcanic-gray space-y-1 mb-4">
                <li>• High-resolution images preferred</li>
                <li>• Include location and date information</li>
                <li>• Respect privacy and property rights</li>
              </ul>
              <Link 
                href="/add-entry" 
                className="inline-flex items-center text-ocean-blue hover:text-ocean-blue/80"
              >
                Start Contributing Photos →
              </Link>
            </div>

            {/* Information Updates */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <DocumentTextIcon className="h-10 w-10 text-valley-green mb-4" />
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                Update Information
              </h4>
              <p className="text-volcanic-gray mb-4">
                Know about a new business, updated hours, or changes to a landmark? 
                Help keep our directory accurate and current.
              </p>
              <ul className="text-sm text-volcanic-gray space-y-1 mb-4">
                <li>• Business hours and contact info</li>
                <li>• New restaurants or accommodations</li>
                <li>• Seasonal closures or changes</li>
              </ul>
              <Link 
                href="mailto:info@nosilha.com" 
                className="inline-flex items-center text-valley-green hover:text-valley-green/80"
              >
                Send Update →
              </Link>
            </div>

            {/* Local Stories */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <MapIcon className="h-10 w-10 text-bougainvillea-pink mb-4" />
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                Share Local Stories
              </h4>
              <p className="text-volcanic-gray mb-4">
                Contribute historical information, cultural insights, or personal 
                stories that help visitors understand Brava's rich heritage.
              </p>
              <ul className="text-sm text-volcanic-gray space-y-1 mb-4">
                <li>• Historical accounts and legends</li>
                <li>• Cultural traditions and customs</li>
                <li>• Personal experiences and tips</li>
              </ul>
              <Link 
                href="/history" 
                className="inline-flex items-center text-bougainvillea-pink hover:text-bougainvillea-pink/80"
              >
                Explore Stories →
              </Link>
            </div>
          </div>
        </section>

        {/* Guidelines Section */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            Contribution Guidelines
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-3">
                Photo Guidelines
              </h4>
              <ul className="space-y-2 text-volcanic-gray">
                <li>• Submit only your original photographs</li>
                <li>• Ensure images are clear and well-lit</li>
                <li>• Include accurate location information</li>
                <li>• Respect private property and people's privacy</li>
                <li>• Avoid overly commercial or promotional content</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-3">
                Information Standards
              </h4>
              <ul className="space-y-2 text-volcanic-gray">
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
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-4">
            Have Questions?
          </h3>
          <p className="text-lg text-volcanic-gray mb-6">
            We're here to help you contribute to the Nos Ilha community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:info@nosilha.com"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
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
    title: 'Contribute to Nos Ilha | Help Build Our Community Guide',
    description: 'Help us build the most comprehensive guide to Brava Island by sharing your knowledge, photos, and experiences with the Nos Ilha community.',
    openGraph: {
      title: 'Contribute to Nos Ilha',
      description: 'Share your photos, stories, and knowledge to help preserve and showcase the beauty of Brava Island.',
      images: ['/images/contribute/community-hero.jpg'],
    },
  };
}