import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { DirectoryCard } from "@/components/ui/directory-card";
import { getEntriesByCategory } from "@/lib/api";
import { 
  MapPinIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  CameraIcon 
} from "@heroicons/react/24/outline";

// Enable ISR with 1 hour revalidation for town content
export const revalidate = 3600;

// Town data based on comprehensive research
const townData = {
  "nova-sintra": {
    name: "Nova Sintra",
    description: "The cultured capital of Brava Island, recognized as a UNESCO World Heritage Tentative List site since 2013",
    population: "Approximately 1,200 residents",
    elevation: "500 meters above sea level",
    founded: "Late 17th century",
    highlights: [
      "UNESCO World Heritage Tentative List site (2013)",
      "Praça Eugénio Tavares - the island's main social hub",
      "Eugénio Tavares House Museum - birthplace of morna music",
      "Colonial sobrados built by diaspora emigrants from New Bedford",
      "Road of 99 turns scenic journey from Furna",
      "Igreja São João Baptista colonial church (c. 1880)"
    ],
    heroImage: "/images/towns/nova-sintra-hero.jpg",
    gallery: [
      "/images/towns/nova-sintra-1.jpg",
      "/images/towns/nova-sintra-2.jpg",
      "/images/towns/nova-sintra-3.jpg"
    ]
  },
  "furna": {
    name: "Furna",
    description: "Brava's maritime gateway nestled in an ancient volcanic crater bay, home to an authentic fishing community",
    population: "Approximately 800 residents",
    elevation: "Sea level",
    founded: "Early 18th century as major port",
    highlights: [
      "Volcanic crater bay providing natural breakwater",
      "Active fishing fleet with colorful artisanal boats",
      "Nossa Senhora dos Navegantes maritime procession",
      "Historic connection to American whaling industry",
      "Nossa Senhora de Boa Viagem chapel overlooking the sea",
      "Traditional fishing community daily rhythms"
    ],
    heroImage: "/images/towns/furna-hero.jpg",
    gallery: [
      "/images/towns/furna-1.jpg",
      "/images/towns/furna-2.jpg",
      "/images/towns/furna-3.jpg"
    ]
  },
  "faja-de-agua": {
    name: "Fajã de Água",
    description: "Brava's original main harbor before 1843, now a verdant paradise famous for magnificent natural swimming pools",
    population: "Approximately 126 residents (2010 census)",
    elevation: "Sea level to 100 meters",
    founded: "18th century as main port",
    highlights: [
      "Magnificent natural swimming pools formed by volcanic rock",
      "Historic main harbor for American whaling ships",
      "Intricate agricultural terraces (socos) on mountainsides",
      "Abandoned Esperadinha Airport runway (closed 2004)",
      "Monumento aos Emigrantes commemorating lost emigrants",
      "Traditional sugarcane spirit (grog) production"
    ],
    heroImage: "/images/towns/faja-de-agua-hero.jpg",
    gallery: [
      "/images/towns/faja-de-agua-1.jpg",
      "/images/towns/faja-de-agua-2.jpg",
      "/images/towns/faja-de-agua-3.jpg"
    ]
  },
  "nossa-senhora-do-monte": {
    name: "Nossa Senhora do Monte",
    description: "Historic pilgrimage sanctuary at 770m elevation, established as official pilgrimage site in 1862",
    population: "Approximately 300 residents",
    elevation: "770 meters above sea level",
    founded: "Parish established around 1826",
    highlights: [
      "Official Catholic pilgrimage church since 1862",
      "Annual Feast of Nossa Senhora do Monte (August 15th)",
      "Religious procession from nearby Mato village",
      "Panoramic views toward Monte Fontainhas (976m peak)",
      "Connection to Madeiran settlers' faith traditions",
      "Administrative center for western Brava parish"
    ],
    heroImage: "/images/towns/nossa-senhora-do-monte-hero.jpg",
    gallery: [
      "/images/towns/nossa-senhora-do-monte-1.jpg",
      "/images/towns/nossa-senhora-do-monte-2.jpg",
      "/images/towns/nossa-senhora-do-monte-3.jpg"
    ]
  },
  "cachaco": {
    name: "Cachaço",
    description: "Remote mountain village at 592m elevation, famous throughout Cape Verde for its traditional handmade goat cheese",
    population: "Approximately 200 residents",
    elevation: "592 meters above sea level",
    founded: "19th century",
    highlights: [
      "Famous Queijo do Cachaço traditional goat cheese",
      "Second southernmost settlement in Cape Verde archipelago",
      "Spectacular views across the water to Fogo island",
      "Traditional cheese-making demonstrations",
      "Remote mountain isolation and tranquility",
      "Authentic rural Cape Verdean village life"
    ],
    heroImage: "/images/towns/cachaco-hero.jpg",
    gallery: [
      "/images/towns/cachaco-1.jpg",
      "/images/towns/cachaco-2.jpg",
      "/images/towns/cachaco-3.jpg"
    ]
  },
  "cova-joana": {
    name: "Cova Joana",
    description: "Strikingly picturesque village nestled within a mountain valley that was once a volcanic crater",
    population: "Approximately 150 residents",
    elevation: "400 meters above sea level",
    founded: "19th century",
    highlights: [
      "Former volcanic crater valley setting",
      "Beautiful colonial sobrados architecture",
      "Vibrant hibiscus hedges throughout the village",
      "Tranquil natural harmony and mountain atmosphere",
      "Location between Nova Sintra and Nossa Senhora do Monte",
      "Traditional Cape Verdean mountain village charm"
    ],
    heroImage: "/images/towns/cova-joana-hero.jpg",
    gallery: [
      "/images/towns/cova-joana-1.jpg",
      "/images/towns/cova-joana-2.jpg",
      "/images/towns/cova-joana-3.jpg"
    ]
  }
};

// Define the props for the dynamic page
interface TownPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TownPage({ params }: TownPageProps) {
  const { slug } = await params;
  
  // Get town data
  const town = townData[slug as keyof typeof townData];
  
  if (!town) {
    notFound();
  }
  
  // Fetch directory entries for this town (for now, we'll get all entries as a fallback)
  let townEntries: any[] = [];
  try {
    const allEntries = await getEntriesByCategory("all");
    // Filter entries by town name (this would be better implemented with a proper API function)
    townEntries = allEntries.filter(entry => 
      entry.town && entry.town.toLowerCase().includes(town.name.toLowerCase())
    );
  } catch (error) {
    console.error("Failed to fetch entries for town:", error);
    townEntries = [];
  }

  return (
    <div className="bg-background-secondary font-sans">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <Image
          src={town.heroImage}
          alt={`Scenic view of ${town.name}, Brava Island`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="max-w-3xl px-4">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {town.name}
            </h1>
            <p className="mt-4 text-lg sm:text-xl">
              {town.description}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Town Overview */}
        <section className="bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-text-primary mb-4">
                About {town.name}
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                {town.description}
              </p>
              
              <h3 className="font-semibold text-lg text-text-primary mb-3">
                What Makes {town.name} Special
              </h3>
              <ul className="space-y-2 text-text-secondary">
                {town.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-ocean-blue mr-2">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="bg-background-secondary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <UserGroupIcon className="h-5 w-5 text-ocean-blue mr-2" />
                  <span className="font-semibold text-text-primary">Population</span>
                </div>
                <p className="text-text-secondary">{town.population}</p>
              </div>
              
              <div className="bg-background-secondary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <MapPinIcon className="h-5 w-5 text-ocean-blue mr-2" />
                  <span className="font-semibold text-text-primary">Elevation</span>
                </div>
                <p className="text-text-secondary">{town.elevation}</p>
              </div>
              
              <div className="bg-background-secondary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-ocean-blue mr-2" />
                  <span className="font-semibold text-text-primary">Founded</span>
                </div>
                <p className="text-text-secondary">{town.founded}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
            Photo Gallery
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {town.gallery.map((image, index) => (
              <div key={index} className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src={image}
                  alt={`View ${index + 1} of ${town.name}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Local Directory Entries */}
        {townEntries.length > 0 && (
          <section className="mt-16">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
              Places to Visit in {town.name}
            </h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {townEntries.map((entry) => (
                <DirectoryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Contribute Section */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg text-center">
          <CameraIcon className="h-12 w-12 text-ocean-blue mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Share Your {town.name} Experience
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Have photos or stories from {town.name}? Help us showcase this beautiful part of Brava Island.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contribute"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Contribute Photos
            </Link>
            <Link
              href="/map"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
            >
              View on Map
            </Link>
          </div>
        </section>

        {/* Navigation */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Explore More of Brava
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/towns"
              className="rounded-md bg-valley-green px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-valley-green/90"
            >
              All Towns & Villages
            </Link>
            <Link
              href="/history"
              className="rounded-md border-2 border-valley-green px-6 py-3 text-base font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              Learn History
            </Link>
            <Link
              href="/directory/all"
              className="rounded-md border-2 border-border-primary px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-text-primary hover:text-background-primary"
            >
              Browse Directory
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Generate static params for known towns
export async function generateStaticParams() {
  return Object.keys(townData).map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TownPageProps) {
  const { slug } = await params;
  const town = townData[slug as keyof typeof townData];
  
  if (!town) {
    return {
      title: 'Town Not Found | Nos Ilha',
    };
  }
  
  return {
    title: `${town.name} | Towns of Brava Island | Nos Ilha`,
    description: town.description,
    openGraph: {
      title: `${town.name} - Brava Island`,
      description: town.description,
      images: [town.heroImage],
    },
  };
}