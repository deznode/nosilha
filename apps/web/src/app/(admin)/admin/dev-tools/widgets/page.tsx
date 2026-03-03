"use client";

import Link from "next/link";
import { ArrowLeft, Sun, Cloud, Heart } from "lucide-react";
import { WeatherWidget } from "@/components/landing/weather-widget";
import { KrioluProverbCard } from "@/components/landing/kriolu-proverb-card";
import { FooterNewsletterForm } from "@/components/newsletter/footer-newsletter-form";
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@/components/ui/tab-group";
import type { TabColor } from "@/components/ui/tab-group";

const weatherVariants: Array<{
  temperature: string;
  location: string;
  condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy";
}> = [
  { temperature: "28°C", location: "Nova Sintra, Brava", condition: "sunny" },
  { temperature: "22°C", location: "Monte Fontainhas", condition: "cloudy" },
  { temperature: "25°C", location: "Fajã d'Água", condition: "partly-cloudy" },
  { temperature: "20°C", location: "Cachaço", condition: "rainy" },
];

const proverbs = [
  {
    proverb: "Ké ki ta fazi caminho é pé.",
    translation: "It is the foot that makes the path.",
  },
  {
    proverb: "Pedra di fufo ta moe milho.",
    translation: "Patience grinds the corn.",
  },
  {
    proverb: "Quem ki ka tem cão, caça ku gato.",
    translation: "He who has no dog hunts with a cat.",
  },
];

const tabColors: TabColor[] = ["blue", "pink", "green", "ochre"];

export default function WidgetsDevPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Widgets</h1>
      <p className="text-muted mb-8">
        WeatherWidget, KrioluProverbCard, FooterNewsletterForm, and TabGroup
        color variants.
      </p>

      <section className="mb-12">
        <h2 className="text-body mb-4 text-lg font-semibold">
          Weather Widget (4 conditions)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weatherVariants.map((weather) => (
            <WeatherWidget key={weather.condition} {...weather} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-body mb-4 text-lg font-semibold">
          Kriolu Proverb Cards
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {proverbs.map((proverb) => (
            <KrioluProverbCard key={proverb.proverb} {...proverb} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-body mb-6 text-lg font-semibold">
          TabGroup (4 color variants)
        </h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {tabColors.map((color) => (
            <div key={color}>
              <h3 className="text-muted mb-2 text-sm font-medium capitalize">
                {color} variant
              </h3>
              <TabGroup>
                <TabList>
                  <Tab icon={Sun} color={color}>
                    Overview
                  </Tab>
                  <Tab icon={Cloud} badge={3} color={color}>
                    Details
                  </Tab>
                  <Tab icon={Heart} color={color}>
                    Reviews
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <p className="text-muted text-sm">
                      Overview content for the {color} tab variant.
                    </p>
                  </TabPanel>
                  <TabPanel>
                    <p className="text-muted text-sm">
                      Details content with a badge showing 3 items.
                    </p>
                  </TabPanel>
                  <TabPanel>
                    <p className="text-muted text-sm">
                      Reviews tab panel content.
                    </p>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">
          Footer Newsletter Form
        </h2>
        <div className="bg-basalt-900 rounded-container max-w-lg p-8">
          <FooterNewsletterForm />
        </div>
      </section>
    </div>
  );
}
