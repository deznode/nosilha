"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  MapPin,
  Camera,
  Anchor,
  Mountain,
  Compass,
  Navigation,
  Store,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

/**
 * Static Marker Component
 * Simplified: No bobbing animation, no ping pulse
 */
function MapMarker({
  icon: Icon,
  label,
  top,
  left,
  colorClass,
  delay,
  shouldReduceMotion,
}: {
  icon: LucideIcon;
  label: string;
  top: string;
  left: string;
  colorClass: string;
  delay: number;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="absolute z-20 flex flex-col items-center gap-2"
      style={{ top, left }}
    >
      {/* Pin Head (Circle) */}
      <div
        className={clsx(
          "relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-xl ring-2 ring-white",
          colorClass
        )}
      >
        <Icon size={18} />
      </div>

      {/* Label (Floating below) */}
      <div className="text-basalt-900 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-md">
        {label}
      </div>
    </motion.div>
  );
}

// Simplified animation variants
const textVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: 0.15 },
  },
};

const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

export function MapTeaserSection() {
  const shouldReduceMotion = useReducedMotion();
  const activeTextVariants = shouldReduceMotion
    ? reducedMotionVariants
    : textVariants;
  const activeImageVariants = shouldReduceMotion
    ? reducedMotionVariants
    : imageVariants;

  return (
    <section className="bg-background-tertiary relative overflow-hidden py-24">
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="border-hairline bg-surface rounded-container shadow-floating flex flex-col items-center gap-12 overflow-hidden border p-8 md:p-12 lg:flex-row">
          {/* Text Content */}
          <motion.div
            variants={activeTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="order-2 lg:order-1 lg:w-1/2"
          >
            <div className="text-ocean-blue mb-4 flex items-center space-x-2 text-sm font-bold tracking-widest uppercase">
              <MapPin className="h-4 w-4" />
              <span>Interactive Map</span>
            </div>

            <h2 className="text-text-primary mb-6 font-serif text-3xl leading-tight font-bold md:text-5xl">
              Navigate the <br />
              <span className="from-ocean-blue to-valley-green bg-gradient-to-r bg-clip-text text-transparent">
                History of Brava
              </span>
            </h2>

            <p className="text-text-secondary mb-4 max-w-md text-lg leading-relaxed">
              Experience the island like never before. Our interactive 3D map
              layers stories, historical places, and cultural landmarks directly
              onto Brava&apos;s volcanic landscape.
            </p>
            <p className="text-text-secondary mb-8 max-w-md text-base leading-relaxed">
              Explore Brava visually—from the mist-covered peaks to the coastal
              villages. Tap into local knowledge, hidden viewpoints, and
              community-recommended spots, all connected to real stories from
              people who know the island best.
            </p>

            {/* Feature List */}
            <ul className="mb-10 space-y-5">
              <li className="flex items-start">
                <div className="bg-bougainvillea-pink/10 text-bougainvillea-pink mt-1 mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Camera size={16} />
                </div>
                <div>
                  <strong className="text-text-primary block text-sm font-bold">
                    Visual History
                  </strong>
                  <span className="text-text-secondary text-sm">
                    See how Brava&apos;s places have changed across time.
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-valley-green/10 text-valley-green mt-1 mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Compass size={16} />
                </div>
                <div>
                  <strong className="text-text-primary block text-sm font-bold">
                    QR Hiking Trails
                  </strong>
                  <span className="text-text-secondary text-sm">
                    Follow curated paths from coast to crater.
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-sobrado-ochre/10 text-sobrado-ochre mt-1 mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Store size={16} />
                </div>
                <div>
                  <strong className="text-text-primary block text-sm font-bold">
                    Local Directory
                  </strong>
                  <span className="text-text-secondary text-sm">
                    Support small businesses, lodges, and community projects.
                  </span>
                </div>
              </li>
            </ul>

            <Link
              href="/map"
              className="group bg-bougainvillea-pink hover:bg-bougainvillea-pink/90 focus-visible:ring-bougainvillea-pink rounded-button shadow-lift hover:shadow-floating inline-flex w-full items-center justify-center gap-2 px-8 py-3 font-bold text-white transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
            >
              <Navigation className="h-5 w-5 transition-transform group-hover:rotate-45" />
              Open Interactive Map
            </Link>
            <p className="text-text-secondary mt-3 text-sm">
              Start with a landmark, story pin, or hiking trail.
            </p>
          </motion.div>

          {/* Visual/Map Preview */}
          <motion.div
            variants={activeImageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="order-1 w-full lg:order-2 lg:w-1/2"
          >
            {/* Map Container */}
            <div className="group bg-ocean-blue/5 rounded-container shadow-floating relative aspect-square w-full overflow-hidden border-4 border-white md:aspect-[4/3]">
              <div className="pointer-events-none absolute inset-0 z-10 bg-stone-900/5 mix-blend-multiply" />
              <Image
                src="/images/map.jpg"
                alt="3D Map of Brava"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Static Markers */}
              <MapMarker
                icon={Anchor}
                label="Furna"
                top="0"
                left="65%"
                colorClass="bg-ocean-blue"
                delay={0.3}
                shouldReduceMotion={shouldReduceMotion}
              />

              <MapMarker
                icon={Camera}
                label="Nova Sintra"
                top="10%"
                left="45%"
                colorClass="bg-bougainvillea-pink"
                delay={0.4}
                shouldReduceMotion={shouldReduceMotion}
              />

              <MapMarker
                icon={Mountain}
                label="Fontainhas"
                top="20%"
                left="53%"
                colorClass="bg-valley-green"
                delay={0.5}
                shouldReduceMotion={shouldReduceMotion}
              />

              {/* UI Overlay Controls */}
              <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2 opacity-80">
                <div className="text-basalt-500 rounded-button flex h-8 w-8 items-center justify-center bg-white/90 shadow-md">
                  <Navigation size={16} />
                </div>
                <div className="text-basalt-500 rounded-button flex h-8 w-8 items-center justify-center bg-white/90 text-xs font-bold shadow-md">
                  3D
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
