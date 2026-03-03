import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import {
  MusicalNoteIcon,
  MicrophoneIcon,
  PlayIcon,
  HeartIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for music content
export const revalidate = 7200;

// Music and arts data (in a real implementation, this would come from the API)
const musicalTraditions = [
  {
    title: "Morna",
    description: "The soul of Cape Verdean music",
    details:
      "Morna is Cape Verde's most famous musical genre, characterized by its melancholic melodies and poetic lyrics that express saudade—a deep longing and nostalgia. Many of the greatest mornas were composed on Brava Island.",
    image: "/images/media/morna-musicians.jpg",
    icon: MusicalNoteIcon,
    color: "ocean-blue",
  },
  {
    title: "Coladeira",
    description: "The danceable rhythm of celebration",
    details:
      "A more upbeat musical style that evolved from morna, coladeira is perfect for dancing and celebrating. It represents the joyful side of Cape Verdean culture and is often played at festivals and gatherings.",
    image: "/images/media/coladeira-dance.jpg",
    icon: PlayIcon,
    color: "valley-green",
  },
  {
    title: "Batuko",
    description: "Traditional women's music",
    details:
      "A rhythmic musical form traditionally performed by women, featuring call-and-response vocals and percussive elements. It represents the strength and resilience of Cape Verdean women.",
    image: "/images/media/batuko-women.jpg",
    icon: MicrophoneIcon,
    color: "bougainvillea-pink",
  },
];

const famousMusicians = [
  {
    name: "Cesária Évora",
    title: "The Barefoot Diva",
    description:
      "Though from Mindelo, Cesária Évora popularized many mornas from Brava Island, bringing Cape Verdean music to the world stage.",
    achievements: [
      "Grammy Award winner",
      "International recognition for Cape Verdean music",
      "Performed barefoot as tribute to the poor",
    ],
    image: "/images/media/cesaria-evora.jpg",
    featured: true,
  },
  {
    name: "Eugénio Tavares",
    title: "The Poet of Morna",
    description:
      "Born in Brava, Eugénio Tavares composed some of the most beautiful mornas ever written, including the famous 'Hora di Bai'.",
    achievements: [
      "Composed 'Hora di Bai'",
      "Father of Cape Verdean poetry",
      "Defined the morna genre",
    ],
    image: "/images/media/eugenio-tavares-music.jpg",
    featured: true,
  },
  {
    name: "Bana",
    title: "The King of Morna",
    description:
      "Adriano Gonçalves, known as Bana, was a master interpreter of mornas and helped preserve the traditional Brava musical style.",
    achievements: [
      "Master of traditional morna",
      "Influenced generations of musicians",
      "Preserved Brava musical heritage",
    ],
    image: "/images/media/bana-musician.jpg",
    featured: false,
  },
];

const culturalEvents = [
  {
    name: "Festival de Música de Brava",
    description: "Annual celebration of Brava's musical heritage",
    details:
      "A festival dedicated to preserving and celebrating the musical traditions of Brava Island, featuring local and international artists.",
    image: "/images/media/music-festival.jpg",
  },
  {
    name: "Noite de Morna",
    description: "Evening dedicated to morna music",
    details:
      "Special events where traditional mornas are performed in their authentic style, often featuring local musicians and storytellers.",
    image: "/images/media/morna-night.jpg",
  },
];

export default function MusicPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Music & Arts"
          subtitle="Explore the rich musical heritage and artistic traditions that have made Brava Island the cultural heart of Cape Verde."
        />

        {/* Introduction Section */}
        <section className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-text-primary mb-4 font-serif text-3xl font-bold">
                The Island of Music
              </h2>
              <p className="text-text-secondary mb-4 text-lg">
                Brava Island has earned its reputation as the musical heart of
                Cape Verde. This small island has produced some of the country's
                greatest musicians, poets, and composers, whose works continue
                to touch hearts around the world.
              </p>
              <p className="text-text-secondary">
                From the haunting melodies of morna to the rhythmic celebrations
                of coladeira, Brava's musical traditions reflect the island's
                unique culture and the experiences of its people.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/media/brava-music-heritage.jpg"
                alt="Traditional musicians performing on Brava Island"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Musical Traditions */}
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
            Musical Traditions
          </h3>

          <div className="space-y-8">
            {musicalTraditions.map((tradition, index) => (
              <div
                key={tradition.title}
                className={`grid items-center gap-8 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
              >
                <div
                  className={`bg-background-primary rounded-lg p-6 shadow-sm ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                >
                  <div className="mb-4 flex items-center">
                    <tradition.icon
                      className={`h-8 w-8 text-${tradition.color} mr-3`}
                    />
                    <h4 className="text-text-primary font-serif text-xl font-bold">
                      {tradition.title}
                    </h4>
                  </div>
                  <p className="text-text-secondary mb-3 text-sm font-medium">
                    {tradition.description}
                  </p>
                  <p className="text-text-secondary">{tradition.details}</p>
                </div>
                <div
                  className={`relative h-64 overflow-hidden rounded-lg ${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                >
                  <Image
                    src={tradition.image}
                    alt={`${tradition.title} musical tradition`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Famous Musicians */}
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
            Notable Musicians
          </h3>

          <div className="grid gap-8 lg:grid-cols-2">
            {famousMusicians
              .filter((musician) => musician.featured)
              .map((musician) => (
                <div
                  key={musician.name}
                  className="bg-background-primary overflow-hidden rounded-lg shadow-sm"
                >
                  <div className="relative h-48">
                    <Image
                      src={musician.image}
                      alt={`${musician.name} - ${musician.title}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-text-primary mb-1 font-serif text-xl font-bold">
                      {musician.name}
                    </h4>
                    <p className="text-ocean-blue mb-3 text-sm font-medium">
                      {musician.title}
                    </p>
                    <p className="text-text-secondary mb-4">
                      {musician.description}
                    </p>

                    <div className="space-y-2">
                      <h5 className="text-text-primary text-sm font-semibold">
                        Notable Achievements:
                      </h5>
                      <ul className="text-text-secondary space-y-1 text-sm">
                        {musician.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-sunny-yellow mr-2">•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Other Musicians */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {famousMusicians
              .filter((musician) => !musician.featured)
              .map((musician) => (
                <div
                  key={musician.name}
                  className="bg-background-primary rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={musician.image}
                        alt={`${musician.name} - ${musician.title}`}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-text-primary mb-1 text-lg font-semibold">
                        {musician.name}
                      </h4>
                      <p className="text-valley-green mb-2 text-sm font-medium">
                        {musician.title}
                      </p>
                      <p className="text-text-secondary mb-2 text-sm">
                        {musician.description}
                      </p>
                      <p className="text-text-secondary text-xs">
                        <span className="font-medium">Known for:</span>{" "}
                        {musician.achievements[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Cultural Events */}
        <section className="bg-background-primary mt-16 rounded-lg p-8 shadow-sm">
          <h3 className="text-text-primary mb-6 text-center font-serif text-2xl font-bold">
            Cultural Events & Festivals
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            {culturalEvents.map((event) => (
              <div key={event.name} className="text-center">
                <div className="relative mb-4 h-48 overflow-hidden rounded-lg">
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-text-primary mb-2 text-lg font-semibold">
                  {event.name}
                </h4>
                <p className="text-ocean-blue mb-2 text-sm font-medium">
                  {event.description}
                </p>
                <p className="text-text-secondary">{event.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Musical Instruments */}
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
            Traditional Instruments
          </h3>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-background-primary rounded-lg p-6 text-center shadow-sm">
              <div className="bg-ocean-blue/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MusicalNoteIcon className="text-ocean-blue h-8 w-8" />
              </div>
              <h4 className="text-text-primary mb-2 font-semibold">Viola</h4>
              <p className="text-text-secondary text-sm">
                The primary string instrument used in morna and coladeira music.
              </p>
            </div>

            <div className="bg-background-primary rounded-lg p-6 text-center shadow-sm">
              <div className="bg-valley-green/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MusicalNoteIcon className="text-valley-green h-8 w-8" />
              </div>
              <h4 className="text-text-primary mb-2 font-semibold">
                Cavaquinho
              </h4>
              <p className="text-text-secondary text-sm">
                A small string instrument that adds rhythmic accompaniment.
              </p>
            </div>

            <div className="bg-background-primary rounded-lg p-6 text-center shadow-sm">
              <div className="bg-bougainvillea-pink/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MusicalNoteIcon className="text-bougainvillea-pink h-8 w-8" />
              </div>
              <h4 className="text-text-primary mb-2 font-semibold">Ferrinho</h4>
              <p className="text-text-secondary text-sm">
                A metal scraper that provides percussion in traditional music.
              </p>
            </div>

            <div className="bg-background-primary rounded-lg p-6 text-center shadow-sm">
              <div className="bg-sunny-yellow/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MusicalNoteIcon className="text-sunny-yellow h-8 w-8" />
              </div>
              <h4 className="text-text-primary mb-2 font-semibold">Tambor</h4>
              <p className="text-text-secondary text-sm">
                Traditional drum used in batuko and other rhythmic music.
              </p>
            </div>
          </div>
        </section>

        {/* Global Impact */}
        <section className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8">
          <h3 className="text-text-primary mb-6 text-center font-serif text-2xl font-bold">
            Global Impact
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <GlobeAltIcon className="text-ocean-blue mx-auto mb-3 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                International Recognition
              </h4>
              <p className="text-text-secondary">
                Brava's musical traditions have gained international
                recognition, with Cape Verdean music being performed in concert
                halls worldwide.
              </p>
            </div>

            <div className="text-center">
              <HeartIcon className="text-valley-green mx-auto mb-3 h-12 w-12" />
              <h4 className="text-text-primary mb-2 text-lg font-semibold">
                Cultural Preservation
              </h4>
              <p className="text-text-secondary">
                Young musicians continue to learn and preserve traditional Brava
                music, ensuring these cultural treasures survive for future
                generations.
              </p>
            </div>
          </div>
        </section>

        {/* Explore More */}
        <section className="mt-16 text-center">
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Explore More Culture
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            Discover more about Brava's rich cultural heritage and the people
            who created it.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/people"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Historical Figures
            </Link>
            <Link
              href="/history"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Island History
            </Link>
            <Link
              href="/media/photos"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Photo Galleries
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
    title: "Music & Arts of Brava Island | Nos Ilha",
    description:
      "Explore the rich musical heritage and artistic traditions that have made Brava Island the cultural heart of Cape Verde, from morna to coladeira.",
    openGraph: {
      title: "Music & Arts - Brava Island",
      description:
        "Discover the musical traditions, famous musicians, and cultural events that define Brava Island's artistic heritage.",
      images: ["/images/media/brava-music-heritage.jpg"],
    },
  };
}
