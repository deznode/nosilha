import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { 
  BookOpenIcon, 
  ClockIcon, 
  GlobeAltIcon,
  MusicalNoteIcon 
} from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for historical content
export const revalidate = 7200;

// Historical content data (in a real implementation, this would come from the API)
const historicalSections = [
  {
    title: "Island Origins",
    description: "The geological formation and early settlement of Brava Island",
    icon: GlobeAltIcon,
    content: "Brava Island, the smallest inhabited island of Cape Verde, was formed by volcanic activity millions of years ago. The island's unique geography, with its steep cliffs and fertile valleys, has shaped the lives of its inhabitants for centuries.",
    image: "/images/history/brava-formation.jpg"
  },
  {
    title: "Cultural Heritage",
    description: "The rich musical and artistic traditions of Brava",
    icon: MusicalNoteIcon,
    content: "Brava is renowned as the 'Island of Flowers' and the 'Island of Music.' It has produced many of Cape Verde's most celebrated musicians and poets, contributing significantly to the country's cultural identity.",
    image: "/images/history/brava-culture.jpg"
  },
  {
    title: "Maritime Legacy",
    description: "The island's connection to the sea and whaling history",
    icon: ClockIcon,
    content: "For generations, Brava islanders have had a strong connection to the sea. Many residents emigrated to work in the American whaling industry, creating lasting cultural bridges between Brava and New England.",
    image: "/images/history/brava-maritime.jpg"
  }
];

const historicalFigures = [
  {
    name: "Eugénio Tavares",
    role: "Poet and Composer",
    description: "Cape Verde's most celebrated poet, transformed morna from satirical to soulful, championing Crioulo as a literary language. His works define the nation's cultural identity.",
    years: "1867-1930"
  },
  {
    name: "Captain Antonio Jose Coelho",
    role: "Sea Captain and Community Leader",
    description: "Key figure in the early diaspora in Rhode Island, served as interpreter and advocate for fellow immigrants. Exemplifies the maritime connection between Brava and New England.",
    years: "c.1851-1944"
  },
  {
    name: "Roosevelt Pires",
    role: "Master Craftsman",
    description: "Continues his family's legendary instrument-making tradition at South End String Instrument in Boston, representing the living bridge between Brava's cultural heritage and global artistry.",
    years: "Contemporary"
  }
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
                The Island of Flowers and Music
              </h2>
              <p className="text-lg text-text-secondary mb-4">
                Brava Island, though the smallest inhabited island in Cape Verde, 
                holds an outsized place in the nation's cultural heritage. Known as 
                &quot;Ilha das Flores&quot; (Island of Flowers), this ancient stratovolcano has been 
                the birthplace of Cape Verde&rsquo;s most celebrated poet, Eugénio Tavares, 
                and the cradle of the nation&rsquo;s beloved morna music.
              </p>
              <p className="text-text-secondary">
                Born from volcanic fire and shaped by the great migration of 1680 when 
                Fogo&rsquo;s eruption sent refugees to its shores, Brava&rsquo;s community was forged 
                not by conquest but by compassion. Its deep connection to the American 
                whaling industry created a transnational identity that continues to thrive 
                in diaspora communities across New England.
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
            A Land Born of Fire: Geological Origins & Early Settlement
          </h3>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Volcanic Foundations
              </h4>
              <p className="text-text-secondary mb-4">
                Brava is fundamentally a geological creation of fire and sea—an ancient stratovolcano 
                rising from the ocean floor. Though appearing as a separate landmass, it remains 
                physically connected beneath the surface to the colossal volcano of neighboring Fogo, 
                making it part of the same immense geological structure.
              </p>
              <p className="text-text-secondary">
                While no eruptions have occurred in the last 10,000 years, persistent seismic activity 
                serves as a reminder of the volcanic forces that shaped this dramatic landscape of 
                steep cliffs and fertile valleys.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                The Great Migration of 1680
              </h4>
              <p className="text-text-secondary mb-4">
                The pivotal event that transformed Brava from a sparsely populated outpost into a 
                permanent settlement was the catastrophic eruption of Pico do Fogo in 1680. This 
                massive volcanic explosion covered much of Fogo with ash, destroying farmland and 
                forcing a desperate exodus.
              </p>
              <p className="text-text-secondary">
                Brava, located just 17-20 kilometers away, became the primary sanctuary for these 
                refugees. This influx of displaced families from Fogo formed the demographic and 
                cultural foundation of Brava's society—a community born not from conquest, but from 
                compassion and survival.
              </p>
            </div>
          </div>
        </section>

        {/* Historical Sections */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Chapters of Brava's Story
          </h3>
          
          <div className="space-y-12">
            {historicalSections.map((section, index) => (
              <div key={section.title} className={`grid gap-8 lg:grid-cols-2 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-4">
                    <section.icon className="h-8 w-8 text-ocean-blue mr-3" />
                    <h4 className="font-serif text-xl font-bold text-text-primary">
                      {section.title}
                    </h4>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 font-medium">
                    {section.description}
                  </p>
                  <p className="text-text-secondary">
                    {section.content}
                  </p>
                </div>
                <div className={`relative h-64 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
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
            Whaling & Maritime Heritage
          </h3>
          
          <div className="bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary mb-8">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <h4 className="font-serif text-xl font-bold text-text-primary mb-4">
                  The Yankee Connection
                </h4>
                <p className="text-text-secondary mb-4">
                  From the late 18th century, American whaling ships from New England began using 
                  Brava's sheltered harbors at Fajã de Água and Furna as essential provisioning stops. 
                  These vessels, hunting whales in the vast Atlantic, found not only supplies but also 
                  some of the world's most skilled mariners.
                </p>
                <p className="text-text-secondary">
                  Bravense men earned legendary reputations as excellent sailors, leading to widespread 
                  recruitment onto whaling voyages. This maritime connection became the foundation of 
                  the lasting bond between Brava and New England, particularly New Bedford, Massachusetts.
                </p>
              </div>
              <div className="relative h-64">
                <div className="h-full bg-gradient-to-br from-ocean-blue/20 to-valley-green/20 rounded-lg flex items-center justify-center">
                  <p className="text-text-secondary text-center italic">
                    Historic whaling vessel<br />
                    [Maritime heritage image]
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                The Packet Trade Era
              </h4>
              <p className="text-text-secondary mb-3">
                As the whaling industry evolved, old whaling vessels were converted into "packet ships" 
                that maintained regular service between Brava and New England ports. These aging but 
                treasured vessels carried passengers, mail, and cargo.
              </p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• <strong>Nellie May:</strong> Made a harrowing 90-day crossing in 1893</li>
                <li>• <strong>Valkyria:</strong> Known as "Queen of the Cape Verde Packets"</li>
                <li>• <strong>Ernestina:</strong> Famous Grand Banks schooner turned packet</li>
              </ul>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Economic Lifeline
              </h4>
              <p className="text-text-secondary mb-3">
                The packet trade created a seasonal rhythm of life, with ships arriving in spring 
                bringing workers for cranberry bogs and textile mills, then returning to Cape Verde 
                in autumn laden with American goods and crucial remittances.
              </p>
              <p className="text-text-secondary text-sm">
                This transnational commerce was more than business—it was the vital artery connecting 
                families separated by the Atlantic, sustaining communities on both sides of the ocean.
              </p>
            </div>
          </div>
        </section>

        {/* Historical Figures - Preview */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="text-center mb-8">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
              Notable Figures from Brava
            </h3>
            <p className="text-text-secondary mb-6">
              Meet some of the remarkable individuals who have shaped Brava&rsquo;s cultural legacy
            </p>
            <Link
              href="/people"
              className="inline-flex items-center rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Explore All Historical Figures
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {historicalFigures.map((figure) => (
              <div key={figure.name} className="border-l-4 border-ocean-blue pl-6">
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
                  Brava Island is discovered by Portuguese navigators during the Age of Exploration.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1680s</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Settlement</h4>
                <p className="text-text-secondary">
                  Permanent settlement begins as refugees from Fogo Island settle on Brava following volcanic eruptions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1774</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Great Famine</h4>
                <p className="text-text-secondary">
                  A severe drought and famine devastates Brava and Fogo, causing widespread death and spurring the first significant wave of emigration to America as a survival strategy.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">Late 1700s</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Whaling Era Begins</h4>
                <p className="text-text-secondary">
                  American whaling ships begin using Brava's harbors at Fajã de Água and Furna, hiring local men as skilled mariners and establishing the critical connection with New England.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1800s</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Packet Trade Era</h4>
                <p className="text-text-secondary">
                  The "Brava Packet Trade" formalizes emigration patterns, with ships carrying passengers, mail, and goods between Brava and New England ports, creating a vital transnational lifeline.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1867</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Birth of Eugénio Tavares</h4>
                <p className="text-text-secondary">
                  Birth of Cape Verde's most celebrated poet and composer, who would transform the morna musical genre and champion Crioulo as a literary language.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1900-1910</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Tavares in Exile</h4>
                <p className="text-text-secondary">
                  Eugénio Tavares lives in New Bedford, Massachusetts, founding the Portuguese-language newspaper "A Alvorada" and writing his most famous mornas about longing for home.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1932</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Literary Legacy</h4>
                <p className="text-text-secondary">
                  Publication of "Mornas: Cantigas Crioulas," Tavares's posthumous collection that becomes a foundational text of Cape Verdean literature.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <div className="flex-shrink-0 w-16 text-center">
                <span className="font-bold text-ocean-blue">1975</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Independence</h4>
                <p className="text-text-secondary">
                  Cape Verde gains independence, and Brava continues its role as a cultural beacon within the new nation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cultural Traditions */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6 text-center">
            Living Traditions
          </h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <MusicalNoteIcon className="h-12 w-12 text-ocean-blue mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Morna Music</h4>
              <p className="text-sm text-text-secondary">
                Brava's distinctive morna style features slow, romantic melodies filled with 
                <em> sodade</em> (longing). Eugénio Tavares transformed it "from laughter to weeping," 
                creating the emotional template for Cape Verde's national music.
              </p>
            </div>
            
            <div className="text-center">
              <BookOpenIcon className="h-12 w-12 text-valley-green mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Oral Storytelling</h4>
              <p className="text-sm text-text-secondary">
                Rich tradition of storytelling that preserves local legends, 
                history, and cultural wisdom.
              </p>
            </div>
            
            <div className="text-center">
              <GlobeAltIcon className="h-12 w-12 text-bougainvillea-pink mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Diaspora Connection</h4>
              <p className="text-sm text-text-secondary">
                Strong cultural ties maintained with Brava communities 
                around the world, especially in New England.
              </p>
            </div>
          </div>
        </section>

        {/* Modern Cultural Preservation & Diaspora */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Living Heritage: Diaspora & Cultural Preservation
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Global Brava Community
              </h4>
              <p className="text-text-secondary mb-3">
                The Brava diaspora, particularly in New England, continues to thrive and influence both 
                homelands. From Massachusetts State Senator Vinny deMacedo to Albany County District 
                Attorney David Soares, Bravense descendants have risen to prominent positions in American 
                civic life while maintaining deep cultural connections.
              </p>
              <p className="text-sm text-text-secondary">
                Contemporary artists like Gardenia Benrós and Vuca Pinheiro work tirelessly to preserve 
                and share Brava's musical traditions with global audiences.
              </p>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary">
              <h4 className="font-semibold text-lg text-text-primary mb-3">
                Contemporary Preservation Efforts
              </h4>
              <p className="text-text-secondary mb-3">
                Modern initiatives focus on documenting traditional knowledge, from ethnobotanical 
                studies preserving medicinal plant practices to community activism ensuring healthcare 
                access. Local leaders like Eugenia Duarte advocate for island rights, while 
                conservationists protect Brava's unique biodiversity.
              </p>
              <p className="text-sm text-text-secondary">
                These efforts ensure that Brava's cultural heritage remains vibrant and relevant 
                for future generations.
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center p-4 bg-gradient-to-br from-ocean-blue/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-ocean-blue mb-1">6,000+</div>
              <div className="text-sm font-medium text-text-primary">Island Population</div>
              <div className="text-xs text-text-secondary">Maintaining traditions</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-valley-green/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-valley-green mb-1">100+</div>
              <div className="text-sm font-medium text-text-primary">Years of Emigration</div>
              <div className="text-xs text-text-secondary">To North America</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-bougainvillea-pink/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-bougainvillea-pink mb-1">Countless</div>
              <div className="text-sm font-medium text-text-primary">Morna Songs</div>
              <div className="text-xs text-text-secondary">Inspired by Brava</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-sunny-yellow/10 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-sunny-yellow mb-1">Active</div>
              <div className="text-sm font-medium text-text-primary">Cultural Projects</div>
              <div className="text-xs text-text-secondary">Preserving heritage</div>
            </div>
          </div>
        </section>

        {/* Explore Further */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Explore More of Brava
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Discover the places where this rich history comes alive today.
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
    title: 'History & Heritage of Brava Island | The Complete Story | Nos Ilha',
    description: 'Discover the complete history of Brava Island, from its volcanic origins and the great 1680 migration to its role as the birthplace of morna music and transatlantic whaling connections.',
    openGraph: {
      title: 'The Complete History of Brava Island - Cultural Heritage & Maritime Legacy',
      description: 'Explore the full story of Brava Island: volcanic origins, Eugénio Tavares, American whaling era, notable figures, and living cultural traditions.',
      images: ['/images/history/brava-overview.jpg'],
    },
    keywords: 'Brava Island history, Cape Verde heritage, Eugénio Tavares, morna music, whaling industry, Cape Verdean diaspora, Island of Flowers, volcanic history',
  };
}