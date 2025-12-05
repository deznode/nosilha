"use client";

import React from "react";
// import Link from 'next/link'; // Uncomment for Next.js
import {
  Calendar,
  MapPin,
  Clock,
  Share2,
  ArrowLeft,
  ExternalLink,
  Users,
  CalendarPlus,
  Mail,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

// --- Temporary Link Component (Delete in real app) ---
const Link = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

// --- Mock Data for a Single Event (Simulating fetched data) ---
const EVENT = {
  id: "6",
  title: "Brava Day USA 2024",
  subtitle: "The Annual Diaspora Gathering",
  date: "2024-07-05",
  startTime: "12:00 PM",
  endTime: "8:00 PM",
  location: "Slater Park, Pawtucket, RI, USA",
  mapUrl: "https://www.google.com/maps", // Real link would go here
  description: `
    Join us for the largest annual gathering of the Brava diaspora in the United States! "Brava Day" is a time-honored tradition where families reconnect, celebrate our shared heritage, and pass our culture down to the next generation.
    
    This year is special as we celebrate the 50th anniversary of the Cape Verdean Independence. Expect live performances from legendary artists flying in from the islands, traditional drumming (Batuque and Kola San Jon), and plenty of Kachupa and Djagacida.
  `,
  schedule: [
    { time: "12:00 PM", activity: "Opening Ceremony & National Anthems" },
    { time: "1:30 PM", activity: "Folklore Dance Performance (Colá San Jon)" },
    { time: "3:00 PM", activity: "Live Music: Morna & Coladeira" },
    { time: "5:00 PM", activity: "Headliner Performance" },
    { time: "7:30 PM", activity: "Closing Remarks" },
  ],
  image:
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2000&auto=format&fit=crop",
  organizer: "Brava United Association",
  organizerEmail: "contact@brava-united.org",
  price: "Free Admission",
  type: "Diaspora",
};

// --- Sub-Components ---

const InfoRow = ({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  action?: React.ReactNode;
}) => (
  <div className="hover:bg-background-secondary/50 flex items-start space-x-4 rounded-xl p-4 transition-colors">
    <div className="bg-ocean-blue/10 text-ocean-blue mt-1 rounded-lg p-2">
      <Icon size={20} />
    </div>
    <div className="flex-grow">
      <h4 className="text-text-secondary mb-1 text-xs font-bold tracking-wider uppercase">
        {label}
      </h4>
      <p className="text-text-primary text-lg font-semibold">{value}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  </div>
);

// --- Main Component ---

export default function EventDetailPage() {
  return (
    <div className="bg-off-white min-h-screen pb-20 font-sans">
      {/* 1. BREADCRUMB / BACK NAV */}
      <div className="border-border-secondary sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link
            href="/events"
            className="text-text-secondary hover:text-ocean-blue flex items-center font-semibold transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Calendar
          </Link>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <div className="bg-basalt-900 relative h-[50vh] min-h-[400px] w-full">
        <Image
          src={EVENT.image}
          alt={EVENT.title}
          fill
          className="object-cover opacity-60"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute right-0 bottom-0 left-0 p-8 md:p-12">
          <div className="container mx-auto">
            <span className="mb-4 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-sm font-bold tracking-wider text-indigo-200 uppercase backdrop-blur-md">
              {EVENT.type} Event
            </span>
            <h1 className="mb-2 font-serif text-4xl leading-tight font-bold text-white md:text-6xl">
              {EVENT.title}
            </h1>
            <p className="text-xl font-medium text-white/80">
              {EVENT.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 container mx-auto -mt-10 px-4">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* 3. MAIN CONTENT (Left Column) */}
          <div className="space-y-8 lg:w-2/3">
            {/* Description Card */}
            <div className="border-border-secondary rounded-2xl border bg-white p-8 shadow-sm">
              <h2 className="text-ocean-blue mb-6 font-serif text-2xl font-bold">
                About the Event
              </h2>
              <div className="prose prose-lg text-text-secondary leading-relaxed whitespace-pre-line">
                {EVENT.description}
              </div>
            </div>

            {/* Schedule Card */}
            <div className="border-border-secondary rounded-2xl border bg-white p-8 shadow-sm">
              <h2 className="text-ocean-blue mb-6 flex items-center font-serif text-2xl font-bold">
                <Clock className="mr-3" /> Event Schedule
              </h2>
              <div className="border-border-secondary relative ml-3 space-y-0 border-l-2 py-2 pl-8">
                {EVENT.schedule.map((item, idx) => (
                  <div key={idx} className="relative mb-8 last:mb-0">
                    <div className="bg-ocean-blue absolute top-1 -left-[41px] h-5 w-5 rounded-full border-4 border-white shadow-sm"></div>
                    <span className="text-ocean-blue mb-1 block text-sm font-bold tracking-wide uppercase">
                      {item.time}
                    </span>
                    <h3 className="text-text-primary text-lg font-bold">
                      {item.activity}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizer Card */}
            <div className="border-mist-100 bg-mist-50 flex items-center justify-between rounded-2xl border p-8">
              <div>
                <h4 className="text-ocean-blue mb-1 text-sm font-bold tracking-wider uppercase">
                  Organized by
                </h4>
                <p className="text-text-primary font-serif text-xl font-bold">
                  {EVENT.organizer}
                </p>
              </div>
              <button className="text-ocean-blue hover:bg-ocean-blue border-mist-200 flex items-center rounded-lg border bg-white px-4 py-2 font-semibold shadow-sm transition-colors hover:text-white">
                <Mail size={18} className="mr-2" />
                Contact
              </button>
            </div>
          </div>

          {/* 4. SIDEBAR (Right Column - Sticky) */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              {/* Key Details Card */}
              <div className="border-border-secondary overflow-hidden rounded-2xl border bg-white shadow-lg">
                <div className="space-y-2 p-2">
                  <InfoRow
                    icon={Calendar}
                    label="Date"
                    value={new Date(EVENT.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    action={
                      <button className="text-ocean-blue flex items-center text-sm font-bold hover:underline">
                        <CalendarPlus size={14} className="mr-1" /> Add to
                        Calendar
                      </button>
                    }
                  />

                  <div className="bg-border-secondary mx-4 h-px" />

                  <InfoRow
                    icon={Clock}
                    label="Time"
                    value={`${EVENT.startTime} - ${EVENT.endTime}`}
                  />

                  <div className="bg-border-secondary mx-4 h-px" />

                  <InfoRow
                    icon={MapPin}
                    label="Location"
                    value={EVENT.location}
                    action={
                      <a
                        href={EVENT.mapUrl}
                        target="_blank"
                        className="text-ocean-blue flex items-center text-sm font-bold hover:underline"
                      >
                        <ExternalLink size={14} className="mr-1" /> Get
                        Directions
                      </a>
                    }
                  />

                  <div className="bg-border-secondary mx-4 h-px" />

                  <InfoRow icon={Users} label="Admission" value={EVENT.price} />
                </div>

                {/* Actions Footer */}
                <div className="border-border-secondary bg-mist-50 grid grid-cols-2 gap-3 border-t p-4">
                  <button className="bg-ocean-blue hover:bg-ocean-blue/90 flex items-center justify-center rounded-xl px-4 py-3 font-bold text-white shadow-md transition-all">
                    Register Now
                  </button>
                  <button className="text-text-secondary border-border-secondary hover:bg-mist-100 flex items-center justify-center rounded-xl border bg-white px-4 py-3 font-bold transition-all">
                    <Share2 size={18} className="mr-2" /> Share
                  </button>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="border-border-secondary group relative h-64 cursor-pointer overflow-hidden rounded-2xl border bg-white p-1 shadow-sm">
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Brava_OpenStreetMap.png/600px-Brava_OpenStreetMap.png')] bg-cover bg-center opacity-60 transition-opacity group-hover:opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold shadow-lg transition-transform group-hover:scale-105">
                    <MapPin size={16} className="text-accent-error mr-2" />
                    View on Map
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
