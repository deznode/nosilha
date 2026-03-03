"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HistoricalTimeline } from "@/components/content/historical-timeline";
import type { TimelineEvent } from "@/components/content/historical-timeline";
import { HistoricalFigures } from "@/components/content/historical-figures";
import type { HistoricalFigure } from "@/components/content/historical-figures";
import { ThematicSections } from "@/components/content/thematic-sections";
import type { ThematicSection } from "@/components/content/thematic-sections";

const mockTimeline: TimelineEvent[] = [
  {
    date: "1462",
    title: "Discovery of Cape Verde",
    description:
      "Portuguese navigators discover the uninhabited Cape Verde archipelago during their exploration of the West African coast.",
  },
  {
    date: "1573",
    title: "Settlement of Brava",
    description:
      "Brava Island is settled, becoming the last of the Cape Verdean islands to be permanently inhabited.",
  },
  {
    date: "1680",
    title: "Fogo Eruption Refugees",
    description:
      "A major volcanic eruption on Fogo drives refugees to Brava, significantly increasing the island's population and cultural diversity.",
  },
  {
    date: "1867",
    title: "Birth of Eugénio Tavares",
    description:
      "Brava's greatest poet, Eugénio Tavares, is born in Nova Sintra. He would become the father of Cape Verdean morna poetry.",
  },
  {
    date: "1900s",
    title: "The Great Diaspora Begins",
    description:
      "Waves of emigration from Brava to New England, particularly to Providence and New Bedford, creating a vibrant diaspora community.",
  },
  {
    date: "1975",
    title: "Cape Verde Independence",
    description:
      "Cape Verde gains independence from Portugal on July 5th, 1975, after centuries of colonial rule.",
  },
];

const mockFigures: HistoricalFigure[] = [
  {
    name: "Eugénio Tavares",
    role: "Poet & Journalist",
    years: "1867-1930",
    description:
      "The greatest poet of Cape Verde, born in Brava. Pioneer of morna music and champion of Kriolu language in literature.",
    slug: "eugenio-tavares",
  },
  {
    name: "Aristides Pereira",
    role: "First President of Cape Verde",
    years: "1923-2011",
    description:
      "Born on Boa Vista, led the independence movement and served as the first president of the Republic of Cape Verde.",
  },
  {
    name: "Cesária Évora",
    role: "Singer & Cultural Ambassador",
    years: "1941-2011",
    description:
      "The 'Barefoot Diva' from Mindelo who brought Cape Verdean morna music to the world stage, winning a Grammy in 2003.",
  },
  {
    name: "Baltasar Lopes da Silva",
    role: "Writer & Linguist",
    years: "1907-1989",
    description:
      "Author of 'Chiquinho', the first Cape Verdean novel, and co-founder of the literary journal Claridade.",
  },
];

const mockSections: ThematicSection[] = [
  {
    title: "Morna: The Soul of Cape Verde",
    description: "A Musical Journey Through Saudade",
    content:
      "Morna is the most iconic musical genre of Cape Verde, characterized by its melancholic melodies and themes of longing, love, and the sea. Born in Brava Island and popularized worldwide by Cesária Évora, morna captures the essence of sodade — the deep longing for homeland that defines the Cape Verdean diaspora experience.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
    imageCourtesy: "Photo by Wes Hicks on Unsplash",
    icon: "Music",
  },
  {
    title: "Kriolu: Our Living Language",
    description: "From Oral Tradition to Literary Identity",
    content:
      "Cape Verdean Kriolu (Crioulo) is a Portuguese-based creole language spoken across the archipelago. Each island has its own variant, with Brava's Kriolu known for its distinctive musicality. From Eugénio Tavares's pioneering poems to modern hip-hop, Kriolu remains the heartbeat of Cape Verdean cultural expression.",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800",
    imageCourtesy: "Photo by Patrick Tomasso on Unsplash",
    icon: "Globe",
  },
  {
    title: "Diaspora Connections",
    description: "Bridging Islands and Continents",
    content:
      "The Cape Verdean diaspora, estimated at over 500,000 people worldwide, maintains deep connections to the islands. From Providence, Rhode Island to Lisbon, Portugal, communities preserve traditions while creating new cultural expressions that blend island heritage with adopted homelands.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    imageCourtesy: "Photo by Samuel Ferrara on Unsplash",
    icon: "Globe",
  },
];

export default function ContentBlocksDevPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Content Blocks</h1>
      <p className="text-muted mb-8">
        HistoricalTimeline, HistoricalFigures, and ThematicSections for heritage
        pages.
      </p>

      <section className="mb-16">
        <h2 className="text-body mb-6 text-lg font-semibold">
          Historical Timeline
        </h2>
        <HistoricalTimeline events={mockTimeline} />
      </section>

      <section className="mb-16">
        <h2 className="text-body mb-6 text-lg font-semibold">
          Historical Figures
        </h2>
        <HistoricalFigures
          figures={mockFigures}
          title="Cultural Architects of Cape Verde"
          subtitle="The visionaries who shaped our island's identity"
          exploreLink="/people"
          exploreLinkText="Explore All Historical Figures"
        />
      </section>

      <section>
        <h2 className="text-body mb-6 text-lg font-semibold">
          Thematic Sections
        </h2>
        <ThematicSections
          sections={mockSections}
          sectionTitle="Chapters of Our Story"
        />
      </section>
    </div>
  );
}
