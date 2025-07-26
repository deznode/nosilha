import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { 
  BookOpenIcon, 
  ClockIcon, 
  GlobeAltIcon,
  MusicalNoteIcon 
} from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for historical content
export const revalidate = 7200;

// Historical content data (in a real implementation, this would come from the API)
const historicalSections = [
  {
    title: "Island Origins",
    description: "The geological formation and early settlement of Brava Island",
    icon: GlobeAltIcon,
    content: "Brava Island, the smallest inhabited island of Cape Verde, was formed by volcanic activity millions of years ago. The island's unique geography, with its steep cliffs and fertile valleys, has shaped the lives of its inhabitants for centuries.",
    image: "/images/history/brava-formation.jpg"
  },
  {
    title: "Cultural Heritage",
    description: "The rich musical and artistic traditions of Brava",
    icon: MusicalNoteIcon,
    content: "Brava is renowned as the 'Island of Flowers' and the 'Island of Music.' It has produced many of Cape Verde's most celebrated musicians and poets, contributing significantly to the country's cultural identity.",
    image: "/images/history/brava-culture.jpg"
  },
  {
    title: "Maritime Legacy",
    description: "The island's connection to the sea and whaling history",
    icon: ClockIcon,
    content: "For generations, Brava islanders have had a strong connection to the sea. Many residents emigrated to work in the American whaling industry, creating lasting cultural bridges between Brava and New England.",
    image: "/images/history/brava-maritime.jpg"
  }
];

const historicalFigures = [
  {
    name: "Eugénio Tavares",
    role: "Poet and Composer",
    description: "One of Cape Verde's most celebrated poets, known for his mornas and love poetry.",
    years: "1867-1930"
  },
  {
    name: "Nhô Djunga",
    role: "Traditional Musician",
    description: "Master of traditional Brava music, preserving the island's musical heritage.",
    years: "1890-1975"
  }
];

export default function HistoryPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="History & Heritage"
          subtitle="Discover the rich cultural tapestry and fascinating history of Brava Island, from its volcanic origins to its vibrant musical traditions."
        />

        {/* Introduction Section */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-4">
                The Island of Flowers and Music
              </h2>
              <p className="text-lg text-text-secondary mb-4">
                Brava Island, though the smallest inhabited island in Cape Verde, 
                holds an outsized place in the nation's cultural heritage. Known as 
                "Ilha das Flores" (Island of Flowers), Brava has been the birthplace 
                of many renowned poets, musicians, and artists.
              </p>
              <p className="text-text-secondary">
                Its dramatic landscape, formed by ancient volcanic activity, has 
                inspired generations of artists and continues to shape the character 
                of its resilient people.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/history/brava-overview.jpg"
                alt="Historical view of Brava Island showing the dramatic volcanic landscape"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Historical Sections */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Chapters of Brava's Story
          </h3>
          
          <div className="space-y-12">
            {historicalSections.map((section, index) => (
              <div key={section.title} className={`grid gap-8 lg:grid-cols-2 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-4">
                    <section.icon className="h-8 w-8 text-ocean-blue mr-3" />
                    <h4 className="font-serif text-xl font-bold text-text-primary">
                      {section.title}
                    </h4>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 font-medium">
                    {section.description}
                  </p>
                  <p className="text-text-secondary">
                    {section.content}
                  </p>
                </div>
                <div className={`relative h-64 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <Image
                    src={section.image}
                    alt={section.description}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historical Figures */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6 text-center">
            Notable Figures from Brava
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {historicalFigures.map((figure) => (
              <div key={figure.name} className="border-l-4 border-ocean-blue pl-6">
                <h4 className="font-semibold text-lg text-text-primary">
                  {figure.name}
                </h4>
                <p className="text-sm text-ocean-blue font-medium mb-2">
                  {figure.role} • {figure.years}
                </p>
                <p className="text-text-secondary">
                  {figure.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Key Historical Periods
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1462</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Discovery</h4>
                <p className="text-text-secondary">
                  Brava Island is discovered by Portuguese navigators during the Age of Exploration.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1680s</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Settlement</h4>
                <p className="text-text-secondary">
                  Permanent settlement begins as refugees from Fogo Island settle on Brava following volcanic eruptions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1800s</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Cultural Flowering</h4>
                <p className="text-text-secondary">
                  The island becomes a center of artistic and musical development, producing many renowned poets and musicians.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1975</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Independence</h4>
                <p className="text-text-secondary">
                  Cape Verde gains independence, and Brava continues its role as a cultural beacon within the new nation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cultural Traditions */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6 text-center">
            Living Traditions
          </h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <MusicalNoteIcon className="h-12 w-12 text-ocean-blue mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Morna Music</h4>
              <p className="text-sm text-text-secondary">
                The soulful musical genre that expresses the Cape Verdean soul, 
                with many masterpieces created on Brava.
              </p>
            </div>
            
            <div className="text-center">
              <BookOpenIcon className="h-12 w-12 text-valley-green mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Oral Storytelling</h4>
              <p className="text-sm text-text-secondary">
                Rich tradition of storytelling that preserves local legends, 
                history, and cultural wisdom.
              </p>
            </div>
            
            <div className="text-center">
              <GlobeAltIcon className="h-12 w-12 text-bougainvillea-pink mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Diaspora Connection</h4>
              <p className="text-sm text-text-secondary">
                Strong cultural ties maintained with Brava communities 
                around the world, especially in New England.
              </p>
            </div>
          </div>
        </section>

        {/* Explore Further */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Explore More of Brava
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Discover the places where this rich history comes alive today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/directory/landmark"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Historical Landmarks
            </Link>
            <Link
              href="/map"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
            >
              Explore the Map
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
    title: 'History & Heritage of Brava Island | Nos Ilha',
    description: 'Discover the rich cultural tapestry and fascinating history of Brava Island, from its volcanic origins to its vibrant musical traditions.',
    openGraph: {
      title: 'History & Heritage - Brava Island',
      description: 'Explore the cultural heritage and historical timeline of Brava Island, known as the Island of Flowers and Music.',
      images: ['/images/history/brava-overview.jpg'],
    },
  };
}