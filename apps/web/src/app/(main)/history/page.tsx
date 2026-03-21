import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { headers, cookies } from "next/headers";

// UI Components
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { ImageHeroSection } from "@/components/ui/image-hero-section";
import { CitationSection } from "@/components/ui/citation-section";
import { ImageWithCourtesy } from "@/components/ui/image-with-courtesy";
import { PrintPageWrapper } from "@/components/ui/print-page-wrapper";
import { ContentActionToolbar } from "@/components/ui/content-action-toolbar";

// Content Components
import { ThematicSections } from "@/components/content/thematic-sections";
import { HistoricalFigures } from "@/components/content/historical-figures";
import { HistoricalTimeline } from "@/components/content/historical-timeline";
import { IconGrid } from "@/components/content/icon-grid";
import { StatisticsGrid } from "@/components/content/statistics-grid";
import { CalloutBox } from "@/components/content/callout-box";
import { Card as ContentCard, CardGrid } from "@/components/content/card";
import { Section } from "@/components/content/section";
import { TwoColumnGrid } from "@/components/content/two-column-grid";
import { SectionTitle } from "@/components/content/section-title";

// Content loader
import {
  getHistoryData,
  getAvailableHistoryLanguages,
} from "@/lib/content/history";
import {
  getBestLanguage,
  detectLanguage,
  type Language,
  LANGUAGE_COOKIE_NAME,
} from "@/lib/content/translations";

// Content ID for reactions
const HISTORY_PAGE_CONTENT_ID = "11111111-2222-4333-8444-555555555555";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHistoryData("en");

  if (!data) {
    return { title: "History Not Found" };
  }

  const { metadata } = data;

  return {
    title: `${metadata.title} | Nos Ilha`,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.openGraph?.title || metadata.title,
      description: metadata.openGraph?.description || metadata.description,
      type: "article",
      publishedTime: metadata.publishDate,
      modifiedTime: metadata.updatedDate,
      authors: [metadata.author],
      tags: metadata.tags,
      images: metadata.openGraph?.images,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
    },
  };
}

interface PageProps {
  searchParams: Promise<{
    lang?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;

  // Resolve language outside cache boundary (uses headers/cookies)
  const availableLanguages = getAvailableHistoryLanguages();

  if (availableLanguages.length === 0) {
    notFound();
  }

  const headersList = await headers();
  const cookieStore = await cookies();
  const acceptLanguage = headersList.get("accept-language");
  const cookieValue = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;

  const requestedLang = detectLanguage(lang, cookieValue, acceptLanguage);
  const bestLang = getBestLanguage(requestedLang, availableLanguages);

  if (!bestLang) {
    notFound();
  }

  return cachedHistoryContent(bestLang);
}

async function cachedHistoryContent(bestLang: Language) {
  "use cache";
  cacheLife("longLived");

  const data = await getHistoryData(bestLang);

  if (!data) {
    notFound();
  }

  const {
    hero,
    sections,
    figures,
    timeline,
    citations,
    iconGridItems,
    statisticsData,
  } = data;

  return (
    <PrintPageWrapper>
      {/* Outer wrapper: -mt-16 pulls content up behind fixed header for transparent navbar effect */}
      <div className="relative -mt-16 font-sans">
        {/* Image Hero - extends behind transparent header */}
        <div className="relative h-[45vh] max-h-[600px] w-full overflow-hidden sm:h-[65vh]">
          <ImageHeroSection
            imageSrc={hero.imageSrc}
            imageAlt="Historical timeline of Brava Island from discovery to present day"
            heightClass="h-full"
          />
        </div>

        {/* Content section with background - starts below hero */}
        <div className="bg-surface">
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
            <PageHeader
              title="Our Island, Our Story"
              subtitle="Settled by refugees from a volcanic eruption, immortalized by a poet's pen, and carried across oceans by whalers and dreamers — Brava's story begins here."
            />

            {/* Content Action Toolbar */}
            <ContentActionToolbar
              contentId={HISTORY_PAGE_CONTENT_ID}
              contentSlug="history-heritage"
              contentTitle="History & Heritage"
              contentUrl="https://nosilha.com/history"
              contentType="Page"
              showOnScroll={true}
              scrollThreshold={250}
              reactions={[
                {
                  id: "LOVE",
                  emoji: "❤️",
                  count: 0,
                  isSelected: false,
                  ariaLabel: "React with love",
                },
                {
                  id: "CELEBRATE",
                  emoji: "🎉",
                  count: 0,
                  isSelected: false,
                  ariaLabel: "React to celebrate",
                },
                {
                  id: "INSIGHTFUL",
                  emoji: "💡",
                  count: 0,
                  isSelected: false,
                  ariaLabel: "Mark as insightful",
                },
                {
                  id: "SUPPORT",
                  emoji: "👏",
                  count: 0,
                  isSelected: false,
                  ariaLabel: "Show support",
                },
              ]}
              isAuthenticated={true}
            />

            {/* Introduction Section */}
            <Section variant="card" className="mt-16">
              <div className="mx-auto max-w-4xl">
                <p className="text-text-secondary mb-6 text-lg">
                  Brava Island occupies a unique position in Cape Verdean
                  history—a place where geography and circumstance converged to
                  create something extraordinary. Known by the Portuguese name
                  &quot;Brava&quot; (wild) for its formidable volcanic terrain,
                  it earned the gentler title{" "}
                  <em className="mx-1">Ilha das Flores</em> (Island of Flowers)
                  for the relative abundance of its mist-fed valleys compared to
                  the more arid neighboring islands.
                </p>
                <p className="text-text-secondary mb-6">
                  At just 62.5 square kilometers, Brava is the smallest
                  inhabited island in the Cape Verde archipelago, yet it has
                  produced a cultural and political influence disproportionate
                  to its size. This phenomenon stems from a defining moment in
                  1680 when a catastrophic eruption of Pico do Fogo forced
                  thousands of refugees from the neighboring island to seek
                  sanctuary on Brava&apos;s shores. Unlike most colonial
                  settlements founded through conquest, Brava&apos;s society was
                  forged through collective compassion and survival.
                </p>
                <p className="text-text-secondary">
                  From Vila Nova Sintra, the mountain capital established around
                  1700 as protection against coastal pirate raids, the
                  island&apos;s entire history unfolds. The American whaling
                  industry of the 18th and 19th centuries transformed Brava from
                  an isolated Portuguese colony into a transnational community,
                  with ships carrying Bravense men to New England ports and
                  eventually establishing the &quot;Brava Packet Trade&quot;
                  that would bind families across the Atlantic for generations.
                  This maritime connection gave birth to the profound cultural
                  sentiment of <em className="mx-1">sodade</em>—the bittersweet
                  longing that defines the Cape Verdean experience of separation
                  and remembrance.
                </p>
              </div>
            </Section>

            {/* Geological Origins & Settlement */}
            <Section variant="card" className="mt-16">
              <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
                A Land Born of Fire: From Submarine Birth to Refuge Island
              </h3>
              <p className="text-text-secondary mb-8 text-center italic">
                The dramatic landscape you see from Vila Nova Sintra today tells
                an ancient story of fire, sea, and human resilience.
              </p>

              <TwoColumnGrid className="mb-8">
                <div>
                  <h4 className="text-text-primary mb-3 text-lg font-semibold">
                    Geological Genesis
                  </h4>
                  <p className="text-text-secondary mb-4">
                    Brava&apos;s story begins in the ocean depths 2-3 million
                    years ago, when it formed as a submarine volcano, its
                    foundation built from pillow lavas and hyaloclastites—the
                    unmistakable signatures of underwater eruptions where molten
                    rock meets cold seawater.
                  </p>
                  <p className="text-text-secondary mb-4">
                    Around 250,000 years ago, a violent new phase began with
                    highly explosive volcanism above sea level, creating the
                    pyroclastic deposits and steep-sided topography that
                    characterizes the island today. Though no historical
                    eruptions are recorded, persistent seismic activity and
                    youthful volcanic features mean Brava cannot be considered
                    extinct.
                  </p>
                  <p className="text-text-secondary">
                    This geological restlessness creates a landscape of
                    precarious beauty—the very ground beneath one&apos;s feet is
                    untrustworthy, perhaps contributing to the cultural
                    phenomenon of <em>sodade</em>, that deep melancholy and
                    longing for stability.
                  </p>
                </div>

                <div>
                  <h4 className="text-text-primary mb-3 text-lg font-semibold">
                    The Great Migration of 1680
                  </h4>
                  <p className="text-text-secondary mb-4">
                    Portuguese explorer Diogo Afonso discovered uninhabited
                    Brava in 1462. The first organized settlement began in 1573
                    under commander Martinho Pereira, with a more significant
                    wave of settlers from Madeira and the Azores arriving around
                    1620. The island&apos;s destiny changed forever in 1680 when
                    Mount Fogo&apos;s catastrophic eruption engulfed the
                    neighboring island in ash, destroying farmland and forcing a
                    desperate mass exodus.
                  </p>
                  <p className="text-text-secondary mb-4">
                    Brava, with its fertile valleys and fresh water, became the
                    primary sanctuary. This sudden influx established deep
                    demographic links—to this day, most Bravan families can
                    trace their origins to Fogo, whether wealthy European
                    landowners or the enslaved people they brought with them.
                  </p>
                  <p className="text-text-secondary">
                    Frequent pirate attacks along the coast soon compelled the
                    refugees to seek safety inland, leading to the founding of
                    the capital, Vila Nova Sintra, around 1700, nestled securely
                    at over 500 meters elevation.
                  </p>
                </div>
              </TwoColumnGrid>

              <CalloutBox
                title="A Community Forged by Compassion"
                variant="ocean-valley"
              >
                Unlike many colonial settlements built through conquest,
                Brava&apos;s society was forged through an act of collective
                compassion and survival. This refugee foundation created a
                unique cultural DNA of resilience, community solidarity, and
                acceptance of otherness that continues to define the
                island&apos;s character today.
              </CalloutBox>
            </Section>

            {/* Thematic Sections - Data Driven */}
            <ThematicSections
              sections={sections}
              sectionTitle="Chapters of Brava's Story"
            />

            {/* Whaling & Maritime Heritage */}
            <Section variant="default" className="mt-16">
              <SectionTitle centered>
                The Yankee Connection: Whaling & Maritime Heritage
              </SectionTitle>

              <ContentCard className="mb-8">
                <TwoColumnGrid>
                  <div>
                    <h4 className="text-text-primary mb-4 font-serif text-xl font-bold">
                      An Engine of Globalization
                    </h4>
                    <p className="text-text-secondary mb-4">
                      From the late 18th century, American whaling ships from
                      New Bedford and other New England ports began frequenting
                      Cape Verdean waters as part of their trans-Atlantic routes
                      to Pacific hunting grounds. Brava&apos;s sheltered harbors
                      at Fajã de Água and Furna became essential provisioning
                      stops, where vessels could replenish fresh water,
                      supplies, and—crucially—crew.
                    </p>
                    <p className="text-text-secondary mb-4">
                      This maritime traffic created an unintentional engine of
                      globalization that permanently broke Brava&apos;s
                      isolation. Yankee captains, recognizing exceptional
                      maritime skills among local men, began systematic
                      recruitment. For Bravans facing recurring cycles of
                      drought, famine, and poverty, a berth on a whaleship
                      offered wages and a chance at a new life.
                    </p>
                    <p className="text-text-secondary">
                      This recruitment transformed Brava from an isolated
                      Portuguese colony into a transnational community,
                      perceived as more &quot;European&quot; and less
                      &quot;African&quot; than its neighbors due to these deep
                      American connections.
                    </p>
                  </div>
                  <div className="relative aspect-video w-full">
                    <ImageWithCourtesy
                      src="/images/history/whaling-heritage3.jpg"
                      alt="Historic whaling vessel representing the maritime connection between Brava and New England"
                      fill
                      className="rounded-lg object-cover object-top"
                    />
                  </div>
                </TwoColumnGrid>
              </ContentCard>

              <CardGrid columns={2}>
                <ContentCard>
                  <h4 className="text-text-primary mb-3 text-lg font-semibold">
                    The &quot;Brava Packet Trade&quot;
                  </h4>
                  <p className="text-text-secondary mb-3">
                    As whaling declined, old whaling vessels were converted into
                    &quot;packet ships&quot; that formalized emigration patterns
                    with regular service between Brava and New England. These
                    aging but treasured vessels became the lifeline of a
                    transnational community, carrying passengers, mail, cargo,
                    and the emotional threads binding families across the
                    Atlantic.
                  </p>
                  <ul className="text-text-secondary space-y-1 text-sm">
                    <li>
                      • <strong>Nellie May:</strong> Endured a harrowing 90-day
                      crossing in 1893
                    </li>
                    <li>
                      • <strong>Valkyria:</strong> Known as the &quot;Queen of
                      the Cape Verde Packets&quot;
                    </li>
                    <li>
                      • <strong>Ernestina:</strong> Famous Grand Banks schooner
                      turned packet ship
                    </li>
                    <li>
                      • <strong>Regular Routes:</strong> Seasonal service
                      connecting Brava to New Bedford, Boston
                    </li>
                  </ul>
                </ContentCard>

                <ContentCard>
                  <h4 className="text-text-primary mb-3 text-lg font-semibold">
                    A Transnational Lifeline
                  </h4>
                  <p className="text-text-secondary mb-3">
                    For over a century, whaling and packet trade became
                    Brava&apos;s principal industry, creating seasonal rhythms
                    that persist today. Ships arrived in spring bringing workers
                    for American cranberry bogs and textile mills, returning in
                    autumn with American goods, letters from family, and crucial
                    remittances that became a pillar of the local economy.
                  </p>
                  <p className="text-text-secondary text-sm">
                    This wasn&apos;t merely commerce—it was the vital
                    circulatory system of a community that existed
                    simultaneously on both sides of the Atlantic. The flow of
                    people, money, goods, and cultural exchange created an
                    identity that was neither fully Cape Verdean nor American,
                    but uniquely Bravan.
                  </p>
                </ContentCard>
              </CardGrid>

              <CalloutBox
                title="Living Legacy"
                variant="valley-ocean"
                className="mt-8"
              >
                This maritime heritage lives on today in the widespread use of
                English on the island, the prevalence of American goods, the
                architectural influence visible in Vila Nova Sintra&apos;s
                well-maintained homes (funded by diaspora remittances), and the
                enduring family connections that bind Brava to Massachusetts
                communities. The whaling era created not just economic ties but
                a cultural bridge that continues to span the Atlantic.
              </CalloutBox>
            </Section>

            {/* Living Traditions - Data Driven Icon Grid */}
            <IconGrid
              title="Living Traditions: The Cultural DNA of Brava"
              items={iconGridItems}
              columns={3}
            />

            {/* Historical Figures - Data Driven */}
            <HistoricalFigures
              figures={figures}
              title="Cultural Architects of Brava"
              subtitle="Discover the remarkable individuals whose extraordinary contributions far exceed the island's small size, creating a legacy that defines Cape Verdean cultural identity"
              exploreLink="/people"
              exploreLinkText="Explore All Historical Figures"
            />

            {/* Timeline - Data Driven */}
            <HistoricalTimeline events={timeline} />

            {/* Contemporary Brava Section */}
            <Section variant="default" className="mt-16">
              <SectionTitle centered>
                Contemporary Brava: Heritage & Innovation
              </SectionTitle>

              <CardGrid columns={2} className="mb-8">
                <ContentCard>
                  <h4 className="text-text-primary mb-3 text-lg font-semibold">
                    The Diaspora Continues to Lead
                  </h4>
                  <p className="text-text-secondary mb-3">
                    Brava&apos;s pattern of producing leaders with outsized
                    influence continues today. From Massachusetts State Senator
                    Vinny deMacedo to Albany County District Attorney David
                    Soares, Bravense descendants achieve prominent positions in
                    American civic life while maintaining deep homeland
                    connections through remittances, cultural preservation, and
                    return visits.
                  </p>
                  <p className="text-text-secondary text-sm">
                    Contemporary artists like Gardenia Benrós and Vuca Pinheiro
                    bridge traditional and modern expression, with recent works
                    explicitly honoring Eugénio Tavares and reviving traditional
                    mandolin music for global audiences.
                  </p>
                </ContentCard>

                <ContentCard>
                  <h4 className="text-text-primary mb-3 text-lg font-semibold">
                    Innovation from Isolation
                  </h4>
                  <p className="text-text-secondary mb-3">
                    Brava&apos;s contemporary challenges mirror its historical
                    patterns: geographic isolation (airport closed since 2004),
                    economic constraints, and climate vulnerability. Yet the
                    island is pioneering innovative solutions, including cloud
                    water collection projects that leverage its unique
                    microclimate to address water scarcity.
                  </p>
                  <p className="text-text-secondary text-sm">
                    Modern preservation efforts focus on documenting traditional
                    ecological knowledge, maintaining architectural heritage
                    (Vila Nova Sintra is on UNESCO&apos;s tentative list), and
                    developing sustainable tourism that preserves the authentic
                    atmosphere that makes Brava unique.
                  </p>
                </ContentCard>
              </CardGrid>

              {/* Statistics Grid - Data Driven */}
              <StatisticsGrid statistics={statisticsData} />

              <CalloutBox
                title="The Paradox Continues"
                variant="pink-yellow"
                className="mt-8"
              >
                Today, Brava remains true to its paradoxical nature: a
                &quot;wild&quot; island known for flowers, a tiny community with
                global influence, an isolated place that created transnational
                identity. Its greatest challenge—geographic isolation—is also
                its greatest asset, preserving an authentic atmosphere in an
                increasingly homogenized world. The future lies in embracing
                this distinctiveness, turning isolation into a compelling
                invitation for those seeking genuine cultural connection.
              </CalloutBox>
            </Section>

            {/* Explore Further */}
            <Section variant="default" className="mt-16 text-center">
              <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
                Continue Your Journey Through Brava
              </h3>
              <p className="text-text-secondary mb-6 text-lg">
                Explore the people, places, and living traditions that make this
                remarkable island&apos;s history tangible today.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/directory/heritage"
                  className="bg-ocean-blue hover:bg-ocean-blue/90 focus-visible:ring-ocean-blue shadow-subtle inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  Historical Landmarks
                </Link>
                <Link
                  href="/map"
                  className="border-mist-200 text-basalt-600 hover:bg-mist-50 focus-visible:ring-ocean-blue dark:border-basalt-600 dark:text-mist-200 dark:hover:bg-basalt-800 inline-flex items-center justify-center rounded-lg border px-6 py-3 text-base font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  Explore the Map
                </Link>
              </div>
            </Section>

            {/* Citation Section */}
            <div className="break-inside-avoid">
              <CitationSection citations={citations} />
            </div>

            <BackToTopButton />
          </div>
        </div>
      </div>
    </PrintPageWrapper>
  );
}
