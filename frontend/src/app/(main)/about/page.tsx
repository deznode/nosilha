import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { 
  HeartIcon, 
  GlobeAltIcon, 
  UsersIcon,
  CodeBracketIcon,
  CameraIcon,
  MapIcon
} from "@heroicons/react/24/outline";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="About Nos Ilha"
          subtitle="A community-driven platform celebrating the cultural heritage and natural beauty of Brava Island, Cape Verde."
        />

        {/* Hero Section */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-volcanic-gray-dark mb-4">
                Preserving Heritage, Building Community
              </h2>
              <p className="text-lg text-volcanic-gray mb-4">
                Nos Ilha is more than a tourism platform—it's a digital bridge connecting 
                Brava Island with the world. Through technology and community collaboration, 
                we're preserving the island's rich cultural heritage while making it accessible 
                to visitors and diaspora communities worldwide.
              </p>
              <p className="text-volcanic-gray">
                Our volunteer-driven, open-source approach ensures that the platform remains 
                true to its community roots while leveraging modern technology to showcase 
                the authentic beauty of Brava Island.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/about/community-collaboration.jpg"
                alt="Community members collaborating on preserving Brava Island's heritage"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-8 text-center">
            Our Mission & Values
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <HeartIcon className="h-12 w-12 text-ocean-blue mx-auto mb-4" />
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                Community First
              </h4>
              <p className="text-volcanic-gray">
                Every feature we build serves the local community of Brava Island, 
                with input from residents, business owners, and cultural experts.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <GlobeAltIcon className="h-12 w-12 text-valley-green mx-auto mb-4" />
              <h4 className="font-semibold text-volcanic-gray-dark mb-2">
                Cultural Preservation
              </h4>
              <p className="text-volcanic-gray">
                We document and preserve Brava's unique history, traditions, and 
                stories for future generations and global audiences.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <UsersIcon className="h-12 w-12 text-bougainvillea-pink mx-auto mb-4" />
              <h4 className="font-semibold text-volcanic-gray-dark mb-2">
                Open Collaboration
              </h4>
              <p className="text-volcanic-gray">
                As an open-source project, we welcome contributions from developers, 
                content creators, and cultural enthusiasts worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Approach */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6">
            Technical Excellence in Service of Culture
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-3">
                Modern Architecture
              </h4>
              <p className="text-volcanic-gray mb-4">
                Built with Next.js 15, React 19, and Spring Boot, our platform combines 
                cutting-edge web technology with robust backend services to deliver a 
                fast, accessible experience for all users.
              </p>
              <ul className="text-sm text-volcanic-gray space-y-1">
                <li>• Next.js App Router with Server Components</li>
                <li>• Spring Boot with Kotlin backend</li>
                <li>• PostgreSQL database with Google Cloud integration</li>
                <li>• AI-powered image analysis and metadata</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-3">
                Community-Driven Development
              </h4>
              <p className="text-volcanic-gray mb-4">
                Every technical decision is made with community needs in mind, ensuring 
                the platform remains accessible, culturally appropriate, and genuinely 
                useful for both locals and visitors.
              </p>
              <ul className="text-sm text-volcanic-gray space-y-1">
                <li>• Open-source codebase on GitHub</li>
                <li>• Mobile-first responsive design</li>
                <li>• Multilingual support planning</li>
                <li>• Accessibility compliance (WCAG AA)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-8 text-center">
            Platform Features
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <MapIcon className="h-8 w-8 text-ocean-blue mb-3" />
              <h4 className="font-semibold text-volcanic-gray-dark mb-2">
                Interactive Map
              </h4>
              <p className="text-sm text-volcanic-gray">
                Navigate Brava Island with our detailed interactive map featuring 
                businesses, landmarks, and cultural sites.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CameraIcon className="h-8 w-8 text-valley-green mb-3" />
              <h4 className="font-semibold text-volcanic-gray-dark mb-2">
                Photo Galleries
              </h4>
              <p className="text-sm text-volcanic-gray">
                Community-contributed photo galleries showcase the island's 
                natural beauty and cultural events.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CodeBracketIcon className="h-8 w-8 text-bougainvillea-pink mb-3" />
              <h4 className="font-semibold text-volcanic-gray-dark mb-2">
                Directory System
              </h4>
              <p className="text-sm text-volcanic-gray">
                Comprehensive directory of restaurants, hotels, landmarks, 
                and cultural sites with detailed information.
              </p>
            </div>
          </div>
        </section>

        {/* Community Impact */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6 text-center">
            Community Impact
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-blue mb-2">100%</div>
              <div className="text-sm text-volcanic-gray-dark font-medium mb-1">Open Source</div>
              <p className="text-xs text-volcanic-gray">
                All code is publicly available, ensuring transparency and community ownership.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-valley-green mb-2">0</div>
              <div className="text-sm text-volcanic-gray-dark font-medium mb-1">Commercial Interests</div>
              <p className="text-xs text-volcanic-gray">
                No commercial backing—purely community-driven and volunteer-supported.
              </p>
            </div>
          </div>
        </section>

        {/* Get Involved */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-4">
            Join Our Community
          </h3>
          <p className="text-lg text-volcanic-gray mb-8">
            Whether you're a developer, photographer, writer, or cultural enthusiast, 
            there's a place for you in the Nos Ilha community.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/contribute"
              className="rounded-md bg-ocean-blue px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Contribute Content
            </Link>
            <Link
              href="https://github.com/nosilha/nosilha"
              className="rounded-md border-2 border-valley-green px-4 py-3 text-sm font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              View on GitHub
            </Link>
            <Link
              href="/contact"
              className="rounded-md border-2 border-bougainvillea-pink px-4 py-3 text-sm font-semibold text-bougainvillea-pink transition-colors hover:bg-bougainvillea-pink hover:text-white"
            >
              Get in Touch
            </Link>
            <Link
              href="/history"
              className="rounded-md border-2 border-volcanic-gray px-4 py-3 text-sm font-semibold text-volcanic-gray transition-colors hover:bg-volcanic-gray hover:text-white"
            >
              Learn More
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
    title: 'About Nos Ilha | Community-Driven Platform for Brava Island',
    description: 'Learn about Nos Ilha, a volunteer-driven, open-source platform celebrating the cultural heritage and natural beauty of Brava Island, Cape Verde.',
    openGraph: {
      title: 'About Nos Ilha - Community-Driven Heritage Platform',
      description: 'A volunteer-supported, open-source platform preserving and sharing the cultural heritage of Brava Island.',
      images: ['/images/about/community-collaboration.jpg'],
    },
  };
}