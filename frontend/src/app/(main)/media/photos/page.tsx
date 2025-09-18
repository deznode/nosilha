import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { PhotoGalleryFilter } from "@/components/ui/photo-gallery-filter";
import {
  CameraIcon,
  PhotoIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

// Enable ISR with 1 hour revalidation for photo content
export const revalidate = 3600;

// Photo galleries data with full cultural context and metadata
const photoGalleries = [
  {
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
    ],
  },
  {
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
  {
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
  {
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
  {
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
  {
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
];

const categories = [
  {
    name: "All",
    value: "all",
    count: photoGalleries.reduce((sum, gallery) => sum + gallery.imageCount, 0),
  },
  {
    name: "Nature",
    value: "nature",
    count: photoGalleries
      .filter((g) => g.category === "Nature")
      .reduce((sum, gallery) => sum + gallery.imageCount, 0),
  },
  {
    name: "Culture",
    value: "culture",
    count: photoGalleries
      .filter((g) => g.category === "Culture")
      .reduce((sum, gallery) => sum + gallery.imageCount, 0),
  },
  {
    name: "Architecture",
    value: "architecture",
    count: photoGalleries
      .filter((g) => g.category === "Architecture")
      .reduce((sum, gallery) => sum + gallery.imageCount, 0),
  },
  {
    name: "Community",
    value: "community",
    count: photoGalleries
      .filter((g) => g.category === "Community")
      .reduce((sum, gallery) => sum + gallery.imageCount, 0),
  },
];

export default function PhotosPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Our Island in Images"
          subtitle="Journey through our home in Brava through the eyes of those who love it most—our neighbors, visitors, and storytellers who capture the moments that make this island extraordinary."
        />

        {/* Introduction Section */}
        <section className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-text-primary mb-4 font-serif text-3xl font-bold">
                Through Our Eyes: Brava in Living Color
              </h2>
              <p className="text-text-secondary mb-4 text-lg">
                Every image in these galleries carries a piece of our island's
                soul. From the morning mist that rolls over Nova Sintra to the
                evening light that turns our coastal pools into mirrors of gold,
                these photographs capture not just how our island looks, but how
                it feels to call this place home.
              </p>
              <p className="text-text-secondary">
                Shared by our community members, longtime visitors, and anyone
                whose heart has been touched by Brava's unique beauty, these
                images are love letters to our <em>Ilha das Flores</em>.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/galleries/brava-photo-overview.jpg"
                alt="Photographer capturing the beauty of Brava Island"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Gallery Filter and Display */}
        <PhotoGalleryFilter
          galleries={photoGalleries}
          categories={categories}
        />

        {/* Contribution Guidelines */}
        <section className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm">
          <h3 className="text-text-primary mb-6 text-center font-serif text-2xl font-bold">
            Share Your Photos
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Photo Submission Guidelines
              </h4>
              <ul className="text-text-secondary space-y-2">
                <li className="flex items-start">
                  <CameraIcon className="text-ocean-blue mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                  High-resolution images (minimum 1200px width)
                </li>
                <li className="flex items-start">
                  <MapPinIcon className="text-ocean-blue mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                  Include location information when possible
                </li>
                <li className="flex items-start">
                  <CalendarIcon className="text-ocean-blue mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                  Add date and context for cultural events
                </li>
                <li className="flex items-start">
                  <EyeIcon className="text-ocean-blue mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                  Respect privacy and property rights
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                What We're Looking For
              </h4>
              <ul className="text-text-secondary space-y-2">
                <li>• Scenic landscapes and natural beauty</li>
                <li>• Cultural events and traditional celebrations</li>
                <li>• Daily life and community moments</li>
                <li>• Historical sites and architecture</li>
                <li>• Local flora and fauna</li>
                <li>• Street scenes and local businesses</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/contribute"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-8 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Contribute Your Photos
            </Link>
          </div>
        </section>

        {/* Community Highlights */}
        <section className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8">
          <h3 className="text-text-primary mb-6 text-center font-serif text-2xl font-bold">
            Community Contributions
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <HeartIcon className="text-ocean-blue mx-auto mb-3 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Local Photographers
              </h4>
              <p className="text-text-secondary">
                Many of our galleries feature work by talented local
                photographers who capture the authentic spirit of Brava Island.
              </p>
            </div>

            <div className="text-center">
              <CameraIcon className="text-valley-green mx-auto mb-3 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Visitor Contributions
              </h4>
              <p className="text-text-secondary">
                Visitors to Brava Island share their unique perspectives,
                helping us showcase the island through different eyes.
              </p>
            </div>
          </div>
        </section>

        {/* Explore More */}
        <section className="mt-16 text-center">
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Explore More of Brava
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            Discover other aspects of Brava Island's rich culture and heritage.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/history"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Island History
            </Link>
            <Link
              href="/map"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Interactive Map
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
    title: "Photo Galleries of Brava Island | Nos Ilha",
    description:
      "Discover the visual story of Brava Island through curated collections of photographs showcasing its natural beauty, cultural heritage, and daily life.",
    openGraph: {
      title: "Photo Galleries - Brava Island",
      description:
        "Explore stunning photographs of Brava Island including landscapes, cultural events, architecture, and community life.",
      images: ["/images/galleries/brava-photo-overview.jpg"],
    },
  };
}
