import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryImageGrid } from "@/components/ui/gallery-image-grid";
import { ArrowLeft, MapPin, ImageIcon } from "lucide-react";

// Enable ISR with 1 hour revalidation for gallery content
export const revalidate = 3600;

// Gallery data structure (this would come from API in production)
interface Photo {
  src: string;
  alt: string;
  location: string;
  date: string;
  description: string;
}

interface Gallery {
  id: string;
  title: string;
  description: string;
  category: string;
  imageCount: number;
  coverImage: string;
  featured: boolean;
  culturalContext: string;
  location: string;
  photos: Photo[];
}

const galleryData: Record<string, Gallery> = {
  landscapes: {
    id: "landscapes",
    title: "Volcanic Majesty",
    description:
      "Our island's dramatic landscapes tell the story of ancient volcanic forces that shaped every valley and peak, from the misty highlands to the rugged coastlines that define our home",
    category: "Nature",
    imageCount: 24,
    coverImage: "/images/galleries/landscapes-cover.jpg",
    featured: true,
    culturalContext:
      "Brava's volcanic origins create some of Cape Verde's most spectacular scenery, with terraced valleys that have sustained our communities for centuries.",
    location: "Throughout Brava Island",
    photos: [
      {
        src: "/images/galleries/landscapes/landscape-1.jpg",
        alt: "Misty morning over Nova Sintra's volcanic peaks",
        location: "Nova Sintra highlands",
        date: "2024",
        description:
          "The early morning mist that earned Brava its lush reputation",
      },
      {
        src: "/images/galleries/landscapes/landscape-2.jpg",
        alt: "Agricultural terraces carved into volcanic slopes",
        location: "Fajã de Água valley",
        date: "2024",
        description:
          "Traditional socos terraces that have fed our families for generations",
      },
      {
        src: "/images/galleries/landscapes/landscape-3.jpg",
        alt: "Panoramic view from Monte Fontainhas peak",
        location: "Monte Fontainhas (976m)",
        date: "2024",
        description:
          "From our highest peak, the entire island and neighboring Fogo are visible",
      },
      {
        src: "/images/galleries/landscapes/landscape-4.jpg",
        alt: "Dramatic cliffs meeting the Atlantic Ocean",
        location: "Western coastline",
        date: "2024",
        description:
          "Where our volcanic island rises directly from the deep Atlantic",
      },
      {
        src: "/images/galleries/landscapes/landscape-5.jpg",
        alt: "Valley mist rolling through Cova Joana crater",
        location: "Cova Joana",
        date: "2024",
        description:
          "The ancient crater valley where hibiscus blooms year-round",
      },
      {
        src: "/images/galleries/landscapes/landscape-6.jpg",
        alt: "Sunset over the road of 99 turns",
        location: "Road to Nova Sintra",
        date: "2024",
        description:
          "The famous winding road that brings every visitor home to our capital",
      },
      {
        src: "/images/galleries/landscapes/landscape-7.jpg",
        alt: "Morning light over terraced mountainsides",
        location: "Mountain valleys",
        date: "2024",
        description:
          "Ancient agricultural terraces that shape our mountain landscape",
      },
      {
        src: "/images/galleries/landscapes/landscape-8.jpg",
        alt: "Volcanic rock formations along the coast",
        location: "Coastal areas",
        date: "2024",
        description:
          "Sculpted by millions of years of Atlantic weather and volcanic activity",
      },
    ],
  },
  coastal: {
    id: "coastal",
    title: "Where Ocean Meets Land",
    description:
      "Our coastlines capture the eternal dialogue between volcanic rock and Atlantic waves, creating natural pools and dramatic seascapes that have sheltered and inspired our people",
    category: "Nature",
    imageCount: 18,
    coverImage: "/images/galleries/coastal-cover.jpg",
    featured: true,
    culturalContext:
      "Brava's coasts have been shaped by both volcanic activity and centuries of Atlantic weather, creating unique formations and natural harbors.",
    location: "Coastal regions",
    photos: [
      {
        src: "/images/galleries/coastal/coastal-1.jpg",
        alt: "Natural swimming pools at Fajã de Água",
        location: "Fajã de Água",
        date: "2024",
        description:
          "Volcanic rock pools where families have swum safely for generations",
      },
      {
        src: "/images/galleries/coastal/coastal-2.jpg",
        alt: "Furna's volcanic crater harbor at sunrise",
        location: "Furna",
        date: "2024",
        description:
          "Our main harbor, perfectly sheltered within an ancient volcanic crater",
      },
      {
        src: "/images/galleries/coastal/coastal-3.jpg",
        alt: "Fishing boats preparing for morning departure",
        location: "Furna harbor",
        date: "2024",
        description:
          "The daily rhythm of our fishing community continues ancient traditions",
      },
      {
        src: "/images/galleries/coastal/coastal-4.jpg",
        alt: "Dramatic sea cliffs of the northern coast",
        location: "Northern coastline",
        date: "2024",
        description:
          "Sheer volcanic cliffs that protect our northern settlements",
      },
      {
        src: "/images/galleries/coastal/coastal-5.jpg",
        alt: "Sunset reflecting off tide pools",
        location: "Western shore",
        date: "2024",
        description:
          "Evening light transforms our rocky shores into mirrors of gold",
      },
      {
        src: "/images/galleries/coastal/coastal-6.jpg",
        alt: "Traditional fishing nets drying in coastal breeze",
        location: "Furna",
        date: "2024",
        description:
          "The tools of our maritime heritage, maintained by skilled hands",
      },
    ],
  },
  cultural: {
    id: "cultural",
    title: "Our Living Traditions",
    description:
      "The celebrations, festivals, and daily customs that keep our island's spirit alive, from religious processions to musical gatherings that echo with the voices of our ancestors",
    category: "Culture",
    imageCount: 32,
    coverImage: "/images/galleries/cultural-cover.jpg",
    featured: true,
    culturalContext:
      "Brava's cultural traditions blend Portuguese Catholic heritage with African rhythms and American influences from our diaspora connections.",
    location: "Various communities",
    photos: [
      {
        src: "/images/galleries/cultural/cultural-1.jpg",
        alt: "Nossa Senhora do Monte pilgrimage procession",
        location: "Nossa Senhora do Monte",
        date: "August 15, 2024",
        description:
          "Annual pilgrimage that has united our mountain communities for over 150 years",
      },
      {
        src: "/images/galleries/cultural/cultural-2.jpg",
        alt: "Traditional morna performance in Praça Eugénio Tavares",
        location: "Nova Sintra",
        date: "2024",
        description:
          "Evening morna in our main square, where Eugénio Tavares once walked",
      },
      {
        src: "/images/galleries/cultural/cultural-3.jpg",
        alt: "Maritime procession of Nossa Senhora dos Navegantes",
        location: "Furna harbor",
        date: "2024",
        description:
          "Blessing of the fishing fleet, honoring the patron saint of seafarers",
      },
      {
        src: "/images/galleries/cultural/cultural-4.jpg",
        alt: "Traditional Cape Verdean cuisine preparation",
        location: "Community kitchen",
        date: "2024",
        description:
          "Preparing catchupa, our national dish that brings families together",
      },
      {
        src: "/images/galleries/cultural/cultural-5.jpg",
        alt: "Festa de São João Baptista celebration",
        location: "Nova Sintra",
        date: "June 24, 2024",
        description:
          "Our island's largest festival, centered around the replica of Columbus's ship",
      },
      {
        src: "/images/galleries/cultural/cultural-6.jpg",
        alt: "Children learning traditional dances",
        location: "Community center",
        date: "2024",
        description: "Passing our cultural heritage to the next generation",
      },
    ],
  },
  architecture: {
    id: "architecture",
    title: "Built Heritage",
    description:
      "The colonial sobrados and sacred spaces that house our memories, from Portuguese-influenced churches to the colorful homes built with love and remittances from distant shores",
    category: "Architecture",
    imageCount: 15,
    coverImage: "/images/galleries/architecture-cover.jpg",
    featured: false,
    culturalContext:
      "Brava's architecture reflects our global connections, with colonial Portuguese influences enhanced by diaspora prosperity from New England.",
    location: "Historic settlements",
    photos: [
      {
        src: "/images/galleries/architecture/arch-1.jpg",
        alt: "Colonial sobrados with traditional balconies in Nova Sintra",
        location: "Nova Sintra",
        date: "2024",
        description:
          "Two-story colonial homes built by successful emigrants returning home",
      },
      {
        src: "/images/galleries/architecture/arch-2.jpg",
        alt: "Igreja São João Baptista colonial church",
        location: "Nova Sintra",
        date: "Built c. 1880",
        description:
          "Our main parish church, centerpiece of community life since the 19th century",
      },
      {
        src: "/images/galleries/architecture/arch-3.jpg",
        alt: "Traditional Cape Verdean house with tropical garden",
        location: "Various villages",
        date: "2024",
        description:
          "Simple island homes surrounded by the flowers that give us our name",
      },
      {
        src: "/images/galleries/architecture/arch-4.jpg",
        alt: "Historic cobblestone streets and pastel facades",
        location: "Nova Sintra historic center",
        date: "2024",
        description:
          "UNESCO Tentative List streets that preserve our colonial heritage",
      },
    ],
  },
  "daily-life": {
    id: "daily-life",
    title: "Island Rhythms",
    description:
      "The gentle pace of daily life on our island, where every morning brings the same warm greetings and every evening finds families gathered under stars that seem closer here than anywhere else",
    category: "Community",
    imageCount: 28,
    coverImage: "/images/galleries/daily-life-cover.jpg",
    featured: false,
    culturalContext:
      "Daily life on Brava follows rhythms set by weather, tides, and community bonds that have sustained us through centuries of challenge and change.",
    location: "Throughout our communities",
    photos: [
      {
        src: "/images/galleries/daily-life/daily-1.jpg",
        alt: "Morning market vendors arranging fresh vegetables",
        location: "Nova Sintra market",
        date: "2024",
        description:
          "The daily ritual of bringing mountain-grown produce to our neighbors",
      },
      {
        src: "/images/galleries/daily-life/daily-2.jpg",
        alt: "Children playing in Praça Eugénio Tavares",
        location: "Nova Sintra",
        date: "2024",
        description:
          "Our central square remains the heart of community life, as it has for generations",
      },
      {
        src: "/images/galleries/daily-life/daily-3.jpg",
        alt: "Elderly residents sharing stories on a shaded bench",
        location: "Village center",
        date: "2024",
        description:
          "The wisdom of elders passed down through daily conversations",
      },
      {
        src: "/images/galleries/daily-life/daily-4.jpg",
        alt: "Traditional bread baking in outdoor oven",
        location: "Community bakery",
        date: "2024",
        description: "Fresh bread baked the way our grandmothers taught us",
      },
    ],
  },
  "flora-fauna": {
    id: "flora-fauna",
    title: "Island of Flowers",
    description:
      "The vibrant life that thrives in our misty climate, from the hibiscus and bougainvillea that color our gardens to the seabirds that fish our coastal waters alongside our boats",
    category: "Nature",
    imageCount: 21,
    coverImage: "/images/galleries/flora-fauna-cover.jpg",
    featured: false,
    culturalContext:
      "Brava's nickname 'Ilha das Flores' comes from our year-round blooms, sustained by Atlantic mists that keep our island green when others are dry.",
    location: "Natural habitats",
    photos: [
      {
        src: "/images/galleries/flora-fauna/flora-1.jpg",
        alt: "Vibrant bougainvillea cascading over garden walls",
        location: "Nova Sintra",
        date: "2024",
        description:
          "The purple blossoms that brighten every neighborhood corner",
      },
      {
        src: "/images/galleries/flora-fauna/flora-2.jpg",
        alt: "Endemic Cape Verde kestrel soaring over cliffs",
        location: "Coastal cliffs",
        date: "2024",
        description:
          "Our native birds of prey, found nowhere else in the world",
      },
      {
        src: "/images/galleries/flora-fauna/flora-3.jpg",
        alt: "Traditional medicinal plants growing wild",
        location: "Mountain slopes",
        date: "2024",
        description:
          "Native plants our ancestors used for healing, still treasured today",
      },
      {
        src: "/images/galleries/flora-fauna/flora-4.jpg",
        alt: "Hibiscus flowers blooming in morning mist",
        location: "Mountain gardens",
        date: "2024",
        description:
          "Morning mist nurtures the flowers that give our island its gentle beauty",
      },
    ],
  },
};

interface GalleryPageProps {
  params: Promise<{
    galleryId: string;
  }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { galleryId } = await params;
  const gallery = galleryData[galleryId];

  if (!gallery) {
    notFound();
  }

  return (
    <div className="bg-background-secondary font-sans">
      {/* Back Navigation */}
      <div className="bg-background-primary border-border-primary border-b">
        <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/media/photos"
            className="text-ocean-blue hover:text-ocean-blue/80 inline-flex items-center font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Photo Galleries
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Gallery Header */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="bg-ocean-blue/10 text-ocean-blue rounded-full px-3 py-1 text-sm">
              {gallery.category}
            </span>
            <span className="text-text-secondary flex items-center text-sm">
              <ImageIcon className="mr-1 h-4 w-4" />
              {gallery.photos.length} images
            </span>
            <span className="text-text-secondary flex items-center text-sm">
              <MapPin className="mr-1 h-4 w-4" />
              {gallery.location}
            </span>
          </div>

          <h1 className="text-text-primary mb-4 font-serif text-4xl font-bold">
            {gallery.title}
          </h1>

          <p className="text-text-secondary mb-6 max-w-4xl text-lg">
            {gallery.description}
          </p>

          <div className="from-ocean-blue/5 to-valley-green/5 border-ocean-blue rounded-lg border-l-4 bg-gradient-to-r p-4">
            <p className="text-text-secondary italic">
              {gallery.culturalContext}
            </p>
          </div>
        </div>

        {/* Image Grid */}
        <GalleryImageGrid photos={gallery.photos} />

        {/* Explore More */}
        <section className="mt-16 text-center">
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Explore More Galleries
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            Discover more visual stories from our beautiful island.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/media/photos"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              All Photo Galleries
            </Link>
            <Link
              href="/contribute"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Share Your Photos
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Generate static params for known galleries
export async function generateStaticParams() {
  return Object.keys(galleryData).map((galleryId) => ({
    galleryId,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: GalleryPageProps) {
  const { galleryId } = await params;
  const gallery = galleryData[galleryId];

  if (!gallery) {
    return {
      title: "Gallery Not Found | Nos Ilha",
    };
  }

  return {
    title: `${gallery.title} | Photo Galleries | Nos Ilha`,
    description: gallery.description,
    openGraph: {
      title: `${gallery.title} - Brava Island Photos`,
      description: gallery.description,
      images: [gallery.coverImage],
    },
  };
}
