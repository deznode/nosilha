import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import {
  BookOpenIcon,
  ClockIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for historical content
export const revalidate = 7200;

// Historical content data based on comprehensive research
const historicalSections = [
  {
    title: "Volcanic Foundations",
    description: "The geological birth of an ancient stratovolcano",
    icon: GlobeAltIcon,
    content:
      "Brava is fundamentally a geological creation of fire and sea—an ancient stratovolcano rising from the ocean floor. Though appearing as a separate landmass, it remains physically connected beneath the surface to the colossal volcano of neighboring Fogo, making it geologically part of the same immense structure. This submarine formation began 2-3 million years ago, with explosive sub-aerial volcanism occurring around 250,000 years ago, creating the dramatic landscape of steep cliffs and fertile valleys that defines the island today.",
    image: "/images/history/brava-formation.jpg",
  },
  {
    title: "Cultural Flowering",
    description: "The birthplace of morna music and Crioulo literature",
    icon: MusicalNoteIcon,
    content:
      "Brava transformed from a place of refuge into the cultural heart of Cape Verde. Here, Eugénio Tavares revolutionized the morna from satirical to soulful, creating the emotional template for the nation's music. His pioneering use of Brava Crioulo as a literary language elevated the vernacular to high art, giving voice to the universal Cape Verdean experience of *sodade*—the profound longing that defines the diaspora experience. The island's cultural contributions far exceed its small size, earning it recognition as the 'Island of Flowers'.",
    image: "/images/history/brava-culture.webp",
  },
  {
    title: "Transnational Community",
    description: "Whaling industry connections forging Atlantic bridges",
    icon: ClockIcon,
    content:
      "The American whaling industry transformed Brava from an isolated Portuguese colony into a transnational community. Yankee whaling captains, impressed by Bravense maritime skills, recruited local men for voyages to Pacific hunting grounds. This connection created the 'Brava Packet Trade'—regular ship service between the island and New England ports, carrying passengers, mail, cargo, and crucial remittances. For over a century, whaling became Brava's principal industry, establishing permanent bonds with Massachusetts communities that continue today.",
    image: "/images/history/brava-maritime2.jpg",
  },
];

const historicalFigures = [
  {
    name: "Eugénio Tavares",
    role: "Cultural Patriarch and Revolutionary",
    description:
      "Cape Verde's definitive cultural figure who transformed morna 'from laughter to weeping,' pioneering Crioulo as a literary language. His exile in New Bedford (1900-1910) intensified his connection to *sodade*, creating the emotional template for Cape Verdean identity. Founded newspapers in both America and Cape Verde, using journalism as cultural and political resistance.",
    years: "1867-1930",
  },
  {
    name: "Marcelino 'Daddy' Grace",
    role: "Religious Entrepreneur and Institution Builder",
    description:
      "Born Marcelino Manuel da Graça on Brava, became 'Sweet Daddy' Grace, founder of United House of Prayer for All People. From a $39 tent in Massachusetts, he built one of the largest African-American religious denominations with 3+ million followers and a $25 million empire. Exemplifies the spectacular scale of Brava's diaspora influence and institutional leadership.",
    years: "1881-1960",
  },
  {
    name: "The Pires Family Legacy",
    role: "Master Luthiers Across Generations",
    description:
      "From Ivo Pires, the self-taught master who brought traditional Bravense instrument-making to Boston in 1967, to his son Roosevelt who continues the craft at South End String Instrument, creating instruments for world-renowned musicians including Yo-Yo Ma. They represent the living transmission of cultural heritage through artisanship.",
    years: "1942-Present",
  },
];

export default function HistoryPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="History & Heritage"
          subtitle="Discover the rich cultural tapestry and fascinating history of Brava Island, from its volcanic origins to its vibrant musical traditions."
        />

        {/* Introduction Section */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-4">
                Our Island, Our Story: The History of Brava
              </h2>
              <p className="text-lg text-text-secondary mb-4">
                Our island has two beautiful sides to its character. The
                Portuguese name "Brava" means "wild" or "brave"—perfect for our
                dramatic volcanic cliffs and steep mountain slopes. But
                throughout Cape Verde, we're known by a gentler name that
                captures our heart:
                <em>Ilha das Flores</em> (Island of Flowers), celebrating the
                lush, green valleys where vibrant flowers bloom year-round in
                our island's cooling mists.
              </p>
              <p className="text-text-secondary mb-4">
                This same duality lives in our culture. Though we're the
                smallest inhabited island in Cape Verde with just 6,000 people,
                Brava has given the world remarkable poets, musicians, and
                leaders whose influence reaches far beyond our shores. At the
                heart of it all is <em>sodade</em>—that deep, beautiful longing
                that every Cape Verdean carries, the feeling that connects us
                all no matter where we go.
              </p>
              <p className="text-text-secondary">
                Our community story began in 1680 when Mount Fogo erupted on the
                neighboring island, sending refugees to find safety on our
                shores. Brava became their sanctuary, and our community was
                built not through conquest, but through compassion and the
                shared will to survive. Later, American whaling ships discovered
                our skilled sailors, creating connections that span the
                Atlantic—making us as much a part of New England families as we
                are of Cape Verde.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/history/brava-overview.jpg"
                alt="Historical view of Brava Island showing the dramatic volcanic landscape"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Geological Origins & Settlement */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            A Land Born of Fire: From Submarine Birth to Refuge Island
          </h3>

          <div className="grid gap-8 lg:grid-cols-2 mb-8">
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Geological Genesis
              </h4>
              <p className="text-text-secondary mb-4">
                Brava's story begins in the ocean depths 2-3 million years ago,
                when it formed as a submarine volcano, its foundation built from
                pillow lavas and hyaloclastites—the unmistakable signatures of
                underwater eruptions where molten rock meets cold seawater.
              </p>
              <p className="text-text-secondary mb-4">
                Around 250,000 years ago, a violent new phase began with highly
                explosive volcanism above sea level, creating the pyroclastic
                deposits and steep-sided topography that characterizes the
                island today. Though no historical eruptions are recorded,
                persistent seismic activity and youthful volcanic features mean
                Brava cannot be considered extinct.
              </p>
              <p className="text-text-secondary">
                This geological restlessness creates a landscape of precarious
                beauty—the very ground beneath one's feet is untrustworthy,
                perhaps contributing to the cultural phenomenon of{" "}
                <em>sodade</em>, that deep melancholy and longing for stability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                The Great Migration of 1680
              </h4>
              <p className="text-text-secondary mb-4">
                Portuguese explorer Diogo Afonso discovered uninhabited Brava in
                1462, but permanent settlement didn't begin until around 1620,
                with only a few hundred fishermen from Madeira and the Azores.
                The island's destiny changed forever in 1680 when Mount Fogo's
                catastrophic eruption engulfed the neighboring island in ash,
                destroying farmland and forcing a desperate mass exodus.
              </p>
              <p className="text-text-secondary mb-4">
                Brava, with its fertile valleys and fresh water, became the
                primary sanctuary. This sudden influx established deep
                demographic links—to this day, most Bravan families can trace
                their origins to Fogo, whether wealthy European landowners or
                the enslaved people they brought with them.
              </p>
              <p className="text-text-secondary">
                Frequent pirate attacks along the coast soon compelled the
                refugees to seek safety inland, leading to the founding of the
                capital, Vila Nova Sintra, around 1700, nestled securely at over
                500 meters elevation.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-ocean-blue/5 to-valley-green/5 p-6 rounded-lg border-l-4 border-ocean-blue">
            <h4 className="font-semibold text-lg text-text-primary mb-3">
              A Community Forged by Compassion
            </h4>
            <p className="text-text-secondary">
              Unlike many colonial settlements built through conquest, Brava's
              society was forged through an act of collective compassion and
              survival. This refugee foundation created a unique cultural DNA of
              resilience, community solidarity, and acceptance of otherness that
              continues to define the island's character today.
            </p>
          </div>
        </section>

        {/* Historical Sections */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Chapters of Brava's Story
          </h3>

          <div className="space-y-12">
            {historicalSections.map((section, index) => (
              <div
                key={section.title}
                className={`grid gap-8 lg:grid-cols-2 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="flex items-center mb-4">
                    <section.icon className="h-8 w-8 text-ocean-blue mr-3" />
                    <h4 className="font-serif text-xl font-bold text-text-primary">
                      {section.title}
                    </h4>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 font-medium">
                    {section.description}
                  </p>
                  <p className="text-text-secondary">{section.content}</p>
                </div>
                <div
                  className={`relative h-64 ${
                    index % 2 === 1 ? "lg:col-start-1" : ""
                  }`}
                >
                  <Image
                    src={section.image}
                    alt={section.description}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Whaling & Maritime Heritage */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            The Yankee Connection: Whaling & Maritime Heritage
          </h3>

          <div className="bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary mb-8">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <h4 className="font-serif text-xl font-bold text-text-primary mb-4">
                  An Engine of Globalization
                </h4>
                <p className="text-text-secondary mb-4">
                  From the late 18th century, American whaling ships from New
                  Bedford and other New England ports began frequenting Cape
                  Verdean waters as part of their trans-Atlantic routes to
                  Pacific hunting grounds. Brava's sheltered harbors at Fajã de
                  Água and Furna became essential provisioning stops, where
                  vessels could replenish fresh water, supplies,
                  and—crucially—crew.
                </p>
                <p className="text-text-secondary mb-4">
                  This maritime traffic created an unintentional engine of
                  globalization that permanently broke Brava's isolation. Yankee
                  captains, recognizing exceptional maritime skills among local
                  men, began systematic recruitment. For Bravans facing
                  recurring cycles of drought, famine, and poverty, a berth on a
                  whaleship offered wages and a chance at a new life.
                </p>
                <p className="text-text-secondary">
                  This recruitment transformed Brava from an isolated Portuguese
                  colony into a transnational community, perceived as more
                  "European" and less "African" than its neighbors due to these
                  deep American connections.
                </p>
              </div>
              <div className="relative h-64">
                <Image
                  src="/images/history/whaling-heritage3.webp"
                  alt="Historic whaling vessel representing the maritime connection between Brava and New England"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                The "Brava Packet Trade"
              </h4>
              <p className="text-text-secondary mb-3">
                As whaling declined, old whaling vessels were converted into
                "packet ships" that formalized emigration patterns with regular
                service between Brava and New England. These aging but treasured
                vessels became the lifeline of a transnational community,
                carrying passengers, mail, cargo, and the emotional threads
                binding families across the Atlantic.
              </p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>
                  • <strong>Nellie May:</strong> Endured a harrowing 90-day
                  crossing in 1893
                </li>
                <li>
                  • <strong>Valkyria:</strong> Known as the "Queen of the Cape
                  Verde Packets"
                </li>
                <li>
                  • <strong>Ernestina:</strong> Famous Grand Banks schooner
                  turned packet ship
                </li>
                <li>
                  • <strong>Regular Routes:</strong> Seasonal service connecting
                  Brava to New Bedford, Boston
                </li>
              </ul>
            </div>

            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                A Transnational Lifeline
              </h4>
              <p className="text-text-secondary mb-3">
                For over a century, whaling and packet trade became Brava's
                principal industry, creating seasonal rhythms that persist
                today. Ships arrived in spring bringing workers for American
                cranberry bogs and textile mills, returning in autumn with
                American goods, letters from family, and crucial remittances
                that became a pillar of the local economy.
              </p>
              <p className="text-text-secondary text-sm">
                This wasn't merely commerce—it was the vital circulatory system
                of a community that existed simultaneously on both sides of the
                Atlantic. The flow of people, money, goods, and cultural
                exchange created an identity that was neither fully Cape Verdean
                nor American, but uniquely Bravan.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-valley-green/5 to-ocean-blue/5 p-6 rounded-lg border-l-4 border-valley-green">
            <h4 className="font-semibold text-lg text-text-primary mb-3">
              Living Legacy
            </h4>
            <p className="text-text-secondary">
              This maritime heritage lives on today in the widespread use of
              English on the island, the prevalence of American goods, the
              architectural influence visible in Vila Nova Sintra's
              well-maintained homes (funded by diaspora remittances), and the
              enduring family connections that bind Brava to Massachusetts
              communities. The whaling era created not just economic ties but a
              cultural bridge that continues to span the Atlantic.
            </p>
          </div>
        </section>

        {/* Historical Figures - Preview */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="text-center mb-8">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
              Cultural Architects of Brava
            </h3>
            <p className="text-text-secondary mb-6">
              Discover the remarkable individuals whose extraordinary
              contributions far exceed the island's small size, creating a
              legacy that defines Cape Verdean cultural identity
            </p>
            <Link
              href="/people"
              className="inline-flex items-center rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Explore All Historical Figures
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {historicalFigures.map((figure) => (
              <div
                key={figure.name}
                className="border-l-4 border-ocean-blue pl-6"
              >
                <h4 className="font-semibold text-lg text-text-primary">
                  {figure.name}
                </h4>
                <p className="text-sm text-ocean-blue font-medium mb-2">
                  {figure.role} • {figure.years}
                </p>
                <p className="text-sm text-text-secondary">
                  {figure.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Key Historical Periods
          </h3>

          <div className="space-y-6">
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1462</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Discovery</h4>
                <p className="text-text-secondary">
                  Brava Island is discovered by Portuguese navigators during the
                  Age of Exploration.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1680</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  The Great Migration
                </h4>
                <p className="text-text-secondary">
                  Mount Fogo's catastrophic eruption forces a mass exodus from
                  the neighboring island. Brava, with its fertile valleys and
                  fresh water, becomes the primary sanctuary for refugees,
                  establishing the demographic foundation of its society through
                  an act of collective compassion rather than conquest.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1774</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  The Great Famine
                </h4>
                <p className="text-text-secondary">
                  A catastrophic drought and famine devastates Brava and Fogo,
                  causing widespread death and desperation. This crisis marks
                  the beginning of systematic emigration to America as a
                  survival strategy, establishing patterns that would define
                  Brava's relationship with the wider world for centuries to
                  come.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">Late 1700s</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  The Whaling Connection
                </h4>
                <p className="text-text-secondary">
                  American whaling ships from New England begin using Brava's
                  sheltered harbors at Fajã de Água and Furna as provisioning
                  stops on trans-Atlantic routes to Pacific hunting grounds.
                  Impressed by Bravense maritime skills, Yankee captains begin
                  systematic recruitment, creating the foundation for over a
                  century of transnational community.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1800s</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  Packet Trade Era
                </h4>
                <p className="text-text-secondary">
                  The "Brava Packet Trade" formalizes emigration patterns, with
                  ships carrying passengers, mail, and goods between Brava and
                  New England ports, creating a vital transnational lifeline.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1867</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  Birth of Eugénio Tavares
                </h4>
                <p className="text-text-secondary">
                  Birth of Cape Verde's most celebrated poet and composer, who
                  would transform the morna musical genre and champion Crioulo
                  as a literary language.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1900-1910</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  Tavares in Political Exile
                </h4>
                <p className="text-text-secondary">
                  Facing persecution for his journalism criticizing Portuguese
                  colonial injustices, Eugénio Tavares is forced into exile in
                  New Bedford. Rather than silencing him, this exile
                  internationalizes his voice. He founds "A Alvorada" (Dawn),
                  the first Portuguese-language newspaper in the United States,
                  and writes his most poignant mornas about *sodade* and
                  separation.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1932</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  Literary Immortality
                </h4>
                <p className="text-text-secondary">
                  Publication of "Mornas: Cantigas Crioulas," Tavares's
                  posthumous collection that becomes the foundational text of
                  Cape Verdean literature. His poem "Morna de Aguada" later
                  appears on the 2000 escudo banknote alongside his portrait,
                  cementing his status as the nation's cultural patriarch.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1975</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  Independence & Cultural Continuity
                </h4>
                <p className="text-text-secondary">
                  Cape Verde gains independence from Portugal, with Brava's
                  cultural contributions—the morna, Crioulo literature, and the
                  concept of *sodade*—now recognized as pillars of national
                  identity. The island continues its role as cultural beacon
                  while maintaining its unique transnational character.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">2004-Present</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">
                  Modern Challenges & Innovation
                </h4>
                <p className="text-text-secondary">
                  Brava's airport closes permanently due to dangerous
                  crosswinds, leaving the island entirely dependent on ferry
                  service and reinforcing its isolation. Yet this challenge
                  sparks innovation: cloud water collection projects leverage
                  the island's unique microclimate, while contemporary artists
                  like Vuca Pinheiro explicitly honor Eugénio Tavares, and the
                  diaspora continues producing leaders like District Attorney
                  David Soares.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cultural Traditions */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6 text-center">
            Living Traditions: The Cultural DNA of Brava
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <MusicalNoteIcon className="h-12 w-12 text-ocean-blue mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">
                The Brava Morna
              </h4>
              <p className="text-sm text-text-secondary">
                Brava pioneered the definitive morna style—slow tempo (around 60
                beats per minute), romantic themes, and accentuated lyricism
                rooted in 19th-century Romanticism. Eugénio Tavares transformed
                it "from laughter to weeping," codifying <em>sodade</em>
                as the emotional core of Cape Verdean identity. This musical
                form became the nation's most powerful cultural export.
              </p>
            </div>

            <div className="text-center">
              <BookOpenIcon className="h-12 w-12 text-valley-green mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">
                Crioulo Literature
              </h4>
              <p className="text-sm text-text-secondary">
                Brava was the birthplace of Cape Verdean literature in the
                vernacular. Tavares pioneered writing in Brava Crioulo,
                elevating the people's language to high art and literary
                prestige. This radical act validated Cape Verdean cultural
                identity and inspired generations of writers to celebrate their
                distinct linguistic heritage.
              </p>
            </div>

            <div className="text-center">
              <GlobeAltIcon className="h-12 w-12 text-bougainvillea-pink mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">
                Transnational Identity
              </h4>
              <p className="text-sm text-text-secondary">
                Brava's unique identity transcends geography—it exists
                simultaneously in Cape Verde and New England. This hyphenated
                identity, forged through whaling and maintained through family
                ties, remittances, and cultural exchange, creates communities
                that are neither fully Cape Verdean nor American, but uniquely
                Bravan.
              </p>
            </div>
          </div>
        </section>

        {/* Modern Cultural Preservation & Contemporary Challenges */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Contemporary Brava: Heritage & Innovation
          </h3>

          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                The Diaspora Continues to Lead
              </h4>
              <p className="text-text-secondary mb-3">
                Brava's pattern of producing leaders with outsized influence
                continues today. From Massachusetts State Senator Vinny deMacedo
                to Albany County District Attorney David Soares, Bravense
                descendants achieve prominent positions in American civic life
                while maintaining deep homeland connections through remittances,
                cultural preservation, and return visits.
              </p>
              <p className="text-sm text-text-secondary">
                Contemporary artists like Gardenia Benrós and Vuca Pinheiro
                bridge traditional and modern expression, with recent works
                explicitly honoring Eugénio Tavares and reviving traditional
                mandolin music for global audiences.
              </p>
            </div>

            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Innovation from Isolation
              </h4>
              <p className="text-text-secondary mb-3">
                Brava's contemporary challenges mirror its historical patterns:
                geographic isolation (airport closed since 2004), economic
                constraints, and climate vulnerability. Yet the island is
                pioneering innovative solutions, including cloud water
                collection projects that leverage its unique microclimate to
                address water scarcity.
              </p>
              <p className="text-sm text-text-secondary">
                Modern preservation efforts focus on documenting traditional
                ecological knowledge, maintaining architectural heritage (Vila
                Nova Sintra is on UNESCO's tentative list), and developing
                sustainable tourism that preserves the authentic atmosphere that
                makes Brava unique.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center p-4 bg-gradient-to-br from-ocean-blue/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-ocean-blue mb-1">
                ~6,000
              </div>
              <div className="text-sm font-medium text-text-primary">
                Island Residents
              </div>
              <div className="text-xs text-text-secondary">
                Smallest inhabited island
              </div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-valley-green/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-valley-green mb-1">
                250+
              </div>
              <div className="text-sm font-medium text-text-primary">
                Years of Diaspora
              </div>
              <div className="text-xs text-text-secondary">
                Since 1774 Great Famine
              </div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-bougainvillea-pink/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-bougainvillea-pink mb-1">
                1867
              </div>
              <div className="text-sm font-medium text-text-primary">
                Tavares Born
              </div>
              <div className="text-xs text-text-secondary">
                Cultural foundation year
              </div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-sunny-yellow/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-sunny-yellow mb-1">
                Global
              </div>
              <div className="text-sm font-medium text-text-primary">
                Cultural Impact
              </div>
              <div className="text-xs text-text-secondary">
                Beyond island's size
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-bougainvillea-pink/5 to-sunny-yellow/5 p-6 rounded-lg border-l-4 border-bougainvillea-pink">
            <h4 className="font-semibold text-lg text-text-primary mb-3">
              The Paradox Continues
            </h4>
            <p className="text-text-secondary">
              Today, Brava remains true to its paradoxical nature: a "wild"
              island known for flowers, a tiny community with global influence,
              an isolated place that created transnational identity. Its
              greatest challenge—geographic isolation—is also its greatest
              asset, preserving an authentic atmosphere in an increasingly
              homogenized world. The future lies in embracing this
              distinctiveness, turning isolation into a compelling invitation
              for those seeking genuine cultural connection.
            </p>
          </div>
        </section>

        {/* Explore Further */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Continue Your Journey Through Brava
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Explore the people, places, and living traditions that make this
            remarkable island's history tangible today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/directory/landmark"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Historical Landmarks
            </Link>
            <Link
              href="/map"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
            >
              Explore the Map
            </Link>
          </div>
        </section>

        <BackToTopButton />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title:
      "Complete History of Brava Island | From Volcanic Origins to Cultural Legacy | Nos Ilha",
    description:
      'Explore Brava Island\'s remarkable history: from its ancient volcanic birth and 1680 refugee settlement to becoming the cultural heart of Cape Verde. Discover how this tiny "Island of Flowers" produced Eugénio Tavares, pioneered morna music, and created lasting bonds with New England through the whaling industry.',
    openGraph: {
      title:
        "Brava Island: The Complete Cultural History - Wild Island, Tender Soul",
      description:
        "Discover how the smallest Cape Verde island became a cultural giant: volcanic formation, Great Migration of 1680, Eugénio Tavares and morna music, whaling era connections to New England, and the living legacy of sodade.",
      images: ["/images/history/brava-overview.jpg"],
    },
    keywords:
      "Brava Island history, Cape Verde cultural heritage, Eugénio Tavares poet, morna music origins, sodade meaning, 1680 Fogo migration, American whaling industry, Cape Verdean diaspora, New Bedford connections, Brava Crioulo literature, Island of Flowers, volcanic stratovolcano, transnational community, Vila Nova Sintra, packet trade era, Brava maritime heritage, Cape Verde smallest island",
  };
}
