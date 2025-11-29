import Link from "next/link";
import Image from "next/image";
import { MapPin, Camera, Anchor } from "lucide-react";

/**
 * MapTeaserSection - Interactive map preview
 *
 * Showcases the interactive heritage map with floating markers
 * and key features list.
 */
export function MapTeaserSection() {
  return (
    <section className="bg-background-tertiary relative overflow-hidden py-20">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="border-border-secondary flex flex-col items-center gap-12 rounded-3xl border bg-white p-8 shadow-2xl md:p-12 lg:flex-row dark:bg-gray-800">
          {/* Text Content */}
          <div className="order-2 lg:order-1 lg:w-1/2">
            <div className="text-ocean-blue mb-4 flex items-center space-x-2 font-bold tracking-widest uppercase">
              <MapPin className="h-5 w-5" />
              <span>Interactive Map</span>
            </div>
            <h2 className="text-text-primary mb-6 font-serif text-3xl font-bold md:text-4xl">
              Navigate the History of Brava
            </h2>
            <p className="text-text-secondary mb-8 text-lg leading-relaxed">
              Experience the island like never before. Our interactive heritage
              map layers historical photos, oral histories, and cultural
              landmarks directly onto the landscape.
            </p>

            {/* Feature List */}
            <ul className="mb-8 space-y-4">
              {[
                "Locate historical buildings in Nova Sintra",
                "Trace hiking trails with GPS support",
                "Find local businesses near you",
              ].map((item, i) => (
                <li
                  key={i}
                  className="text-volcanic-gray-dark flex items-center"
                >
                  <div className="bg-valley-green mr-3 h-2 w-2 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/map"
              className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center rounded-lg px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              Open Interactive Map
            </Link>
          </div>

          {/* Visual/Map Preview */}
          <div className="order-1 w-full lg:order-2 lg:w-1/2">
            <div className="group relative aspect-square overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-inner transition-all duration-500 hover:shadow-2xl md:aspect-video dark:border-gray-700">
              {/* Map Image */}
              <Image
                src="/images/map.jpeg"
                alt="Map of Brava"
                fill
                className="object-cover opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-100 dark:mix-blend-normal"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Floating Markers */}
              <div className="absolute top-1/3 left-1/2 z-10 flex animate-bounce items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
                <div className="bg-bougainvillea-pink rounded-md p-1.5 text-white">
                  <Camera size={14} />
                </div>
                <div className="pr-1 text-xs font-bold text-gray-800">
                  Fajã d&apos;Agua
                </div>
              </div>

              <div className="absolute right-1/3 bottom-1/3 z-10 flex animate-pulse items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
                <div className="bg-ocean-blue rounded-md p-1.5 text-white">
                  <Anchor size={14} />
                </div>
                <div className="pr-1 text-xs font-bold text-gray-800">
                  Furna Port
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
