import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ImageWithCourtesy } from "@/components/ui/image-with-courtesy";
import {
  MusicalNoteIcon,
  StarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { CitationSection } from "@/components/ui/citation-section";
import { PrintButton } from "@/components/ui/print-button";
import { PrintPageWrapper } from "@/components/ui/print-page-wrapper";

// Enable ISR with 2 hour revalidation for people content
export const revalidate = 7200;

// Historical figures organized chronologically by era and influence
const historicalEras = [
  {
    era: "Cultural Foundation",
    period: "1867-1930",
    description: "Forging a national soul through art and language",
    context:
      "This foundational era marks the period when a distinctly Cape Verdean cultural identity was first articulated, codified, and disseminated. Figures of this time elevated the morna to national soul music and pioneered Cape Verdean Crioulo as a legitimate literary language, laying the emotional and artistic groundwork for all future movements.",
    figures: [
      {
        name: "Eugénio Tavares",
        role: "Cultural Patriarch and Revolutionary",
        category: "Literature & Music",
        years: "1867-1930",
        influence: "Revolutionary",
        description:
          "Cape Verde's definitive cultural figure who transformed morna 'from laughter to weeping,' pioneering Crioulo as a literary language. His exile in New Bedford (1900-1910) intensified his connection to sodade, creating the emotional template for Cape Verdean identity worldwide.",
        achievements: [
          "Transformed morna from satirical to deeply emotional, soulful genre",
          "Published 'Mornas: Cantigas Crioulas' posthumously in 1932, foundational Cape Verdean literature",
          "Founded 'A Alvorada' (Dawn), first Portuguese-language newspaper in the United States",
          "Featured on 2000 escudo banknote, cementing status as national cultural icon",
        ],
        image: "/images/people/eugenio-tavares.jpg",
        courtesy: "barrosbrito.com",
        featured: true,
      },
      {
        name: "Nhô Raul de Pina",
        role: "Master Violinist and Traditional Keeper",
        category: "Music & Tradition",
        years: "Late 1800s-Early 1900s",
        influence: "Foundational",
        description:
          "Though biographical details remain primarily in community memory, this legendary violinist and composer from Brava 'marked generations' with his mastery of traditional morna techniques. His profound musical legacy established the instrumental foundation that complemented Tavares's lyrical innovations.",
        achievements: [
          "Master violinist who influenced generations of Brava musicians",
          "Preserved and transmitted classical morna instrumental techniques",
          "Established musical lineage that continues through descendants",
          "Represented the anonymous backbone of Brava's musical culture",
        ],
        image: "/images/people/nho-raul-pina.jpg",
        courtesy: "Cabo Verde & a Música",
        featured: false,
      },
    ],
  },
  {
    era: "Political Awakening",
    period: "1900-1975",
    description:
      "From cultural pride to political action and national liberation",
    context:
      "Building on Tavares's cultural foundation, this generation translated identity into political struggle, contributing directly to Cape Verde's independence movement.",
    figures: [
      {
        name: "Artur Augusto da Silva",
        role: "Writer and Independence Activist",
        category: "Literature & Politics",
        years: "1912-1983",
        influence: "Revolutionary",
        description:
          "Multifaceted intellectual who embodied the transition from cultural pride to political struggle. Close collaborator of Amílcar Cabral, he actively defended political prisoners and served as Supreme Court judge after independence.",
        achievements: [
          "Published poetry in the influential *Claridade* movement",
          "Close friend and collaborator of independence leader Amílcar Cabral",
          "Defended political prisoners against colonial oppression",
          "Served as Supreme Court judge in post-independence Guinea-Bissau",
        ],
        image: "/images/people/artur-silva.jpg",
        courtesy: "Antifascistas da Resistência",
        featured: true,
      },
      {
        name: "Viriato de Barros",
        role: "Diplomat and Nation-Builder",
        category: "Diplomacy & Education",
        years: "1932-2018",
        influence: "National",
        description:
          "Post-independence diplomat who represented Cape Verde abroad as Ambassador to Senegal and the Holy See, and Chargé d'Affaires in Washington D.C. Later became an intellectual exploring Cape Verdean identity through his books 'Identidade' and 'Para Lá de Alcatraz.'",
        achievements: [
          "Served as Ambassador to Senegal and the Holy See",
          "Chargé d'Affaires in Washington D.C. (from 1978)",
          "Director of Secondary Education shaping post-independence generation",
          "Author exploring Cape Verdean identity in globalized world",
        ],
        image: "/images/people/viriato-barros.jpg",
        courtesy: "barrosbrito.com",
        featured: true,
      },
    ],
  },
  {
    era: "Diaspora Expansion",
    period: "1880s-1960s",
    description: "Building global communities and institutions",
    context:
      "This era showcases the most dramatic evidence of the 'Brava Phenomenon.' Fueled by whaling industry connections, migrants demonstrated remarkable capacity for leadership, entrepreneurship, and institution-building. Far from their homeland, they founded massive religious movements, established resilient community networks, and achieved phenomenal global influence.",
    figures: [
      {
        name: "Marcelino 'Daddy' Grace",
        role: "Religious Entrepreneur and Institution Builder",
        category: "Faith & Business",
        years: "1881 (some sources indicate 1884)-1960",
        influence: "Phenomenal",
        description:
          "Born Marcelino Manuel da Graça on Brava, became 'Sweet Daddy' Grace, founder of United House of Prayer for All People. From a $39 tent in Massachusetts, he built one of the largest and wealthiest African-American religious denominations of the 20th century, demonstrating the transference of Brava's maritime leadership culture to American urban religious life.",
        achievements: [
          "Founded United House of Prayer with 3+ million followers in 350+ locations",
          "Built business empire valued at $25 million by death, including Manhattan real estate",
          "Pioneer of integrated congregations in segregated American South",
          "Created commercial enterprises selling 'Grace Coffee' and 'Grace Cold Cream'",
        ],
        image: "/images/people/daddy-grace.jpg",
        courtesy: "the Stuart A. Rose Library, Emory University",
        featured: true,
      },
      {
        name: "João José Dias",
        role: "Religious Pioneer and Missionary",
        category: "Faith & Mission",
        years: "1873-1964",
        influence: "Global",
        description:
          "Born on Brava, followed his sea captain father to New Bedford where he converted to the Church of the Nazarene. Returned to Brava in 1901 to establish the first Protestant mission in Cape Verde, enduring decades of persecution, imprisonment, and violence to plant a religious movement that spread across 44 African nations.",
        achievements: [
          "Founded first Church of the Nazarene in Africa on Brava (1901)",
          "Initiated religious movement that spread to 44 African nations",
          "Survived four imprisonments and violent persecution for faith",
          "Street named in his honor in Vila Nova Sintra",
        ],
        image: "/images/people/joao-dias.jpg",
        courtesy: "the Church of the Nazarene Global Archives",
        featured: true,
      },
      {
        name: "Adelina Domingues",
        role: "Centenarian Missionary and Community Leader",
        category: "Faith & Longevity",
        years: "1888-2002",
        influence: "Cultural",
        description:
          "Born on Brava, emigrated to New Bedford in 1907 and lived 114 years, becoming the world's oldest person at death. Active missionary for Church of the Nazarene who used factory earnings to fund religious work, sending Bibles and aid back to Brava. Her 1953 ministry in Brava was so effective that 'every tavern in the village closed and dance halls stopped functioning.'",
        achievements: [
          "Lived 114 years, 183 days - verified as world's oldest person at death",
          "Active grassroots missionary organizing Cape Verdean Protestant community",
          "Donated family property on Brava to Church of the Nazarene",
          "Embodied century of diaspora history as living repository",
        ],
        image: "/images/people/adelina-domingues.jpg",
        courtesy: "LongeviQuest",
        featured: false,
      },
      {
        name: "Padre Pio Gottin",
        role: "Missionary and Community Builder",
        category: "Faith & Community",
        years: "1924-1999",
        influence: "Community",
        description:
          "Italian Capuchin priest who served Brava for 24 years (1955-1979), remembered as 'father, missionary, educator, and friend.' His 'Escola Materna' fed over 300 children during severe droughts. Demonstrates Brava's cultural gravity—capable of attracting dedicated individuals from abroad who became integral community pillars.",
        achievements: [
          "Served Brava community with dedication for 24 years (1955-1979)",
          "Created 'Escola Materna' feeding 300+ children during famines",
          "Founded Congregation of Franciscan Sisters of Immaculate Conception",
          "Followed diaspora to U.S., ministering to Cape Verdean immigrants until death",
        ],
        image: "/images/people/padre-pio.jpg",
        courtesy: "Padre Pio Gottin Charities, Inc.",
        featured: false,
      },
      {
        name: "Ivo Pires",
        role: "Master Luthier",
        category: "Traditional Crafts",
        years: "1942-2009",
        influence: "Cultural",
        description:
          "Self-taught master craftsman who, according to his son Roosevelt Pires, emigrated to Boston in 1967, bringing traditional Bravense instrument-making skills to America. Professionalized his craft and passed knowledge to his son Roosevelt.",
        achievements: [
          "Master luthier who brought Bravense craft to America",
          "Established professional workshop and reputation in Boston",
          "Preserved and refined traditional instrument-making techniques",
          "Founded dynasty continuing through son Roosevelt",
        ],
        image: "/images/people/ivo-pires.jpg",
        courtesy: "Cabo Verde & a Música",
        featured: false,
      },
      {
        name: "Antonio Jose Coelho",
        role: "Sea Captain and Community Leader",
        category: "Maritime & Community",
        years: "c. 1851-c. 1944",
        influence: "Community",
        description:
          "Early diaspora leader in Providence, Rhode Island who served as interpreter and community pillar for fellow Cape Verdean immigrants. Owned the packet schooner 'Nellie May' that transported people and goods between New England and Brava, fighting for years to reclaim his ship after dubious auction proceedings.",
        achievements: [
          "Community interpreter and leader in Fox Point, Providence",
          "Operated vital transport lifeline between Brava and New England",
          "Advocated directly to U.S. Presidents Cleveland and McKinley",
          "Exemplified tenacity and resilience of early diaspora pioneers",
        ],
        image: "/images/people/antonio-coelho.jpg",
        courtesy: "the Cape Verdean Museum",
        featured: false,
      },
    ],
  },
  {
    era: "Contemporary Era",
    period: "1975-Present",
    description:
      "Modern leadership and cultural preservation in the global age",
    context:
      "Contemporary figures continue Brava's legacy of disproportionate influence, from American politics to international cultural preservation, maintaining connections between island and diaspora.",
    figures: [
      {
        name: "David Soares",
        role: "District Attorney and Legal Reformer",
        category: "Law & Politics",
        years: "b.1969",
        influence: "National",
        description:
          "Born on Brava, raised in Rhode Island, became long-serving District Attorney for Albany County, New York. Gained national reputation as progressive prosecutor challenging harsh drug laws and government corruption.",
        achievements: [
          "Long-serving District Attorney with national reputation",
          "Progressive prosecutor challenging Rockefeller drug laws",
          "High-profile government integrity cases",
          "Cornell University and Albany Law School graduate",
        ],
        image: "/images/people/david-soares.webp",
        courtesy: "the Office of the Albany County District Attorney",
        featured: true,
      },
      {
        name: "Roosevelt Pires",
        role: "Master Craftsman",
        category: "Arts & Heritage",
        years: "Contemporary",
        influence: "Cultural",
        description:
          "Continues his father's legendary instrument-making tradition at South End String Instrument in Boston. Represents the living bridge between Brava's cultural heritage and global artistry, working on instruments for world-renowned musicians.",
        achievements: [
          "Maintains family tradition of master luthiers from Brava",
          "Repairs and maintains instruments for professional musicians including Yo-Yo Ma",
          "Bridges traditional Bravense craftsmanship with modern techniques",
          "Preserves and shares cultural heritage through artisanship",
        ],
        image: "/images/people/roosevelt-pires.jpg",
        courtesy: "Friends of the South End Library",
        featured: false,
      },
      {
        name: "Vuca Pinheiro",
        role: "Musician and Cultural Preservationist",
        category: "Music & Heritage",
        years: "Contemporary",
        influence: "Cultural",
        description:
          "Contemporary singer, composer, and instrumentalist explicitly dedicated to preserving Brava's musical heritage. His 2023 albums directly honor Eugénio Tavares and revive the island's mandolin traditions.",
        achievements: [
          "Released *Ilha Brava Ilha Formosa* featuring Tavares's 'Hino Bravense'",
          "Revived island's mandolin tradition with *Bandolins da Ilha Brava*",
          "Preserves and performs traditional Bravense music internationally",
          "Bridges historical and contemporary musical expression",
        ],
        image: "/images/people/vuca-pinheiro.jpg",
        courtesy: "Vuca Pinheiro",
        featured: false,
      },
      {
        name: "Ana Lúcia Ramos Lisboa",
        role: "Film Director and Historian",
        category: "Film & Documentation",
        years: "Contemporary",
        influence: "Cultural",
        description:
          "Film director born in Furna who documents Cape Verde's independence history. Her work on Amílcar Cabral and national identity brings Brava's contribution to liberation full circle through cinema.",
        achievements: [
          "Directed acclaimed documentary on independence leader Amílcar Cabral",
          "Created *Cabo Verde nha cretcheu* exploring national identity",
          "Uses Cape Verdean landscapes to explore democratic principles",
          "Historicizes revolution that figures like Artur Silva participated in",
        ],
        image: "/images/people/ana-lisboa.png",
        courtesy: "CinAfrica",
        featured: false,
      },
      {
        name: "Nilton Fernandes",
        role: "Professional Footballer and Global Ambassador",
        category: "Sports & Athletics",
        years: "1979-2024",
        influence: "Global",
        description:
          "Brava-born footballer who competed professionally across five European countries, achieving success in Slovenia's top division with championship and cup victories. His career spanned over a decade in Europe's competitive football landscape.",
        achievements: [
          "Won Slovenian PrvaLiga with NK Maribor (2008-09 season)",
          "Won Slovenian Football Cup with FC Koper (2006-07)",
          "Competed in top leagues across 5 European countries",
          "Represented modern diaspora pathway through athletic excellence",
        ],
        image: "/images/people/nilton-fernandes2.webp",
        courtesy: "SAPO",
        featured: false,
      },
      {
        name: "Vinny deMacedo",
        role: "State Senator and Public Servant",
        category: "Politics & Public Service",
        years: "b. 1965",
        influence: "National",
        description:
          "Born on Brava, immigrated to Massachusetts at six months old. Long-serving Republican legislator in Massachusetts House and Senate who represents the modern diaspora's political success and diverse ideological paths within American democracy.",
        achievements: [
          "Served over two decades in Massachusetts legislature",
          "Small business owner demonstrating entrepreneurial success",
          "Republican leader representing conservative diaspora voice",
          "Bridge between Cape Verdean community and American politics",
        ],
        image: "/images/people/vinny-demacedo.jpg",
        courtesy: "the Massachusetts Legislature",
        featured: false,
      },
      {
        name: "Gardenia Benrós",
        role: "Cultural Preservationist and Singer",
        category: "Music & Heritage",
        years: "Contemporary",
        influence: "Cultural",
        description:
          "International singer with deep Brava family roots who preserves and performs traditional morna. Her parents were from Brava, her grandmother was a contemporary of Eugénio Tavares, and her debut album featured five Tavares compositions, bridging historical and contemporary musical expression.",
        achievements: [
          "Albums featuring Brava songwriters including Tavares compositions",
          "International career preserving traditional morna repertoire",
          "Bridge between Brava's golden age and contemporary global audiences",
          "Cultural ambassador for Cape Verdean musical heritage",
        ],
        image: "/images/people/gardenia-benros.jpg",
        courtesy: "Cabo Verde & a Música",
        featured: false,
      },
    ],
  },
];

const citations = [
  {
    source: "Brava, Cape Verde - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Brava,_Cape_Verde",
  },
  {
    source: "Cape Verde: Brava - Portuguese Historical Museum",
    author: "Portuguese Historical Museum",
    year: 2025,
    url: "https://portuguesemuseum.org/?page_id=1808&category=3&event=325",
  },
  {
    source: "Official Tourist Guide - brava - Capo Verde",
    author: "caboverde.com",
    year: 2025,
    url: "http://www.caboverde.com/ilhas/brava/guide-e.htm",
  },
  {
    source: "Eugénio Tavares - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Eug%C3%A9nio_Tavares",
  },
  {
    source: "Roosevelt Pires — FOSEL: Friends of the South End Library",
    author: "FOSEL",
    year: 2021,
    url: "https://www.friendsofsouthendlibrary.org/local-focus/2021/6/eric-knudson-w2g3w-rsy4b-hw8xn",
  },
  {
    source: "Dias, João José - Dictionary of African Christian Biography",
    author: "Dictionary of African Christian Biography",
    year: 2025,
    url: "https://dacb.org/stories/capeverde/dias-joao/",
  },
  {
    source: "Domingues, Adelina - Dictionary of African Christian Biography",
    author: "Dictionary of African Christian Biography",
    year: 2025,
    url: "https://dacb.org/stories/capeverde/domingues-adelina/",
  },
  {
    source: "Remember Padre Pio Gottin - Brava News",
    author: "Brava News",
    year: 2025,
    url: "https://www.brava.news/en/remember-padre-pio-gottin",
  },
  {
    source: "About the DA - Albany County District Attorney",
    author: "Albany County District Attorney",
    year: 2025,
    url: "https://www.albanycountyda.com/about.html",
  },
  {
    source: "Nilton Fernandes - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Nilton_Fernandes",
  },
  {
    source: "Marcelino Manuel da Graça - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Marcelino_Manuel_da_Gra%C3%A7a",
  },
  {
    source: "Marcelino Manuel da Graça - Encyclopaedia Britannica",
    author: "Britannica",
    year: 2025,
    url: "https://www.britannica.com/biography/Marcelino-Manuel-da-Graca",
  },
  {
    source: "Artur Augusto da Silva - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Artur_Augusto_da_Silva",
  },
  {
    source: "Viriato de Barros - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Viriato_de_Barros",
  },
  {
    source: "Vinny deMacedo - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Vinny_deMacedo",
  },
  {
    source: "Ana Lúcia Ramos Lisboa - Wikipedia",
    author: "Wikipedia",
    year: 2025,
    url: "https://en.wikipedia.org/wiki/Ana_L%C3%BAcia_Ramos_Lisboa",
  },
  {
    source: "Gardénia Benrós - Cabo Verde & a Música Virtual Museum",
    author: "Cabo Verde & a Música",
    year: 2025,
    url: "https://eng.caboverdeamusica.online/gardenia-benros/",
  },
  {
    source: "Vuca Pinheiro - Cabo Verde & a Música Virtual Museum",
    author: "Cabo Verde & a Música",
    year: 2025,
    url: "https://eng.caboverdeamusica.online/vuca-pinheiro/",
  },
  {
    source: "Captain Antonio Jose Coelho - The Creola Genealogist",
    author: "The Creola Genealogist",
    year: 2025,
    url: "https://thecreolagenealogist.com/tag/captain-antonio-jose-coelho/",
  },
  {
    source: "Ivo Pires - Cape Verdean Museum Hall of Fame",
    author: "Cape Verdean Museum",
    year: 2005,
    url: "https://capeverdeanmuseum.org/hall-of-fame/f/2005-hof-ivo-pires",
  },
];

export default function PeoplePage() {
  return (
    <PrintPageWrapper>
      <div className="bg-background-secondary font-sans">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <PageHeader
            title="Historical Figures"
            subtitle="Discover the remarkable people who shaped Brava Island's rich cultural heritage and continue to inspire generations."
          />

          {/* Print Button */}
          <PrintButton className="mb-8" />

          {/* Introduction Section */}
          <section className="bg-background-primary border-border-primary mt-16 rounded-lg border p-8 shadow-sm">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-text-primary mb-4 font-serif text-3xl font-bold">
                  Our People, Our Legacy: The Extraordinary Sons and Daughters
                  of Brava
                </h2>
                <p className="text-text-secondary mb-4 text-lg">
                  Our beautiful island tells a remarkable story. Known as{" "}
                  <em>Ilha das Flores</em>
                  (Island of Flowers) for its lush, mist-covered valleys, Brava
                  may be the smallest inhabited island in Cape Verde—just 62
                  square kilometers—but from our shores have come extraordinary
                  individuals whose influence has touched hearts and changed
                  lives across continents, shaping Cape Verdean culture,
                  national identity, and diaspora communities worldwide.
                </p>
                <p className="text-text-secondary mb-4">
                  This remarkable legacy isn&apos;t by chance—it&apos;s rooted
                  in our unique history: the 1680 Fogo eruption that brought
                  refugees who found sanctuary here, the American whaling ships
                  that connected us to New England, and a maritime culture that
                  nurtured strong leaders, creative spirits, and entrepreneurs
                  who carried Brava&apos;s values wherever they traveled.
                </p>
                <p className="text-text-secondary">
                  From Eugénio Tavares who gave Cape Verde its cultural voice
                  through morna and <em>sodade</em>, to Marcelino
                  &quot;Daddy&quot; Grace who built a spiritual movement with
                  millions of followers, to contemporary leaders like David
                  Soares making their mark in American politics—our people show
                  that an island&apos;s true size is measured not in kilometers,
                  but in the courage, creativity, and lasting impact of its sons
                  and daughters.
                </p>
              </div>
              <div className="relative h-64 lg:h-80">
                {/* TODO: Update courtesy text with proper source attribution */}
                <ImageWithCourtesy
                  src="/images/people/brava-cultural-heritage.jpg"
                  alt="Cultural heritage of Brava Island showing traditional life and customs"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-lg object-cover object-top"
                />
              </div>
            </div>
          </section>

          {/* Historical Progression of Influence */}
          <section className="mt-16">
            <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
              Historical Progression of Influence
            </h3>
          </section>

          {/* Historical Eras */}
          {historicalEras.map((era, eraIndex) => (
            <section key={era.era} className="mt-16">
              {/* Era Header */}
              <div className="mb-8">
                <div className="mb-4 flex items-center">
                  <div className="bg-ocean-blue/10 mr-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <span className="text-ocean-blue text-lg font-bold">
                      {eraIndex + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-text-primary font-serif text-2xl font-bold">
                      {era.era} ({era.period})
                    </h3>
                    <p className="text-text-secondary font-medium">
                      {era.description}
                    </p>
                  </div>
                </div>
                <div className="from-ocean-blue/5 to-valley-green/5 border-ocean-blue rounded-lg border-l-4 bg-gradient-to-r p-4">
                  <p className="text-text-secondary italic">{era.context}</p>
                </div>
              </div>

              {/* Era Figures */}
              <div className="space-y-8">
                {era.figures.map((figure) => (
                  <div
                    key={figure.name}
                    className={`grid gap-6 lg:grid-cols-${
                      figure.featured ? "2" : "1"
                    } ${
                      figure.featured
                        ? "bg-background-primary border-border-primary rounded-lg border p-6 shadow-sm"
                        : "bg-background-primary/50 rounded-lg p-4"
                    }`}
                  >
                    {figure.featured && (
                      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
                        {/* TODO: Update courtesy text with proper source attribution */}
                        <ImageWithCourtesy
                          src={figure.image}
                          alt={`Portrait of ${figure.name}`}
                          courtesy={figure.courtesy}
                          variant="large"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="rounded-lg object-cover object-top"
                          priority={figure.name === "Eugénio Tavares"}
                        />
                      </div>
                    )}

                    <div className={figure.featured ? "" : "flex items-start"}>
                      {!figure.featured && (
                        <div className="mr-4 flex-shrink-0">
                          {/* TODO: Update courtesy text with proper source attribution */}
                          <ImageWithCourtesy
                            src={figure.image}
                            alt={`Portrait of ${figure.name}`}
                            courtesy={figure.courtesy}
                            variant="icon"
                            tooltipPosition="right"
                            width={112}
                            height={112}
                            sizes="112px"
                            className="rounded-full object-cover object-top"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="mb-2 flex items-center">
                          <span className="bg-ocean-blue/10 text-ocean-blue rounded px-2 py-1 text-xs">
                            {figure.category}
                          </span>
                          <span className="text-text-secondary ml-2 flex items-center text-xs">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {figure.years}
                          </span>
                          <span
                            className={`ml-2 rounded px-2 py-1 text-xs ${
                              figure.influence === "Revolutionary"
                                ? "bg-bougainvillea-pink/10 text-bougainvillea-pink"
                                : figure.influence === "Phenomenal"
                                  ? "bg-sunny-yellow/10 text-sunny-yellow"
                                  : figure.influence === "National"
                                    ? "bg-valley-green/10 text-valley-green"
                                    : figure.influence === "Global"
                                      ? "bg-ocean-blue/20 text-ocean-blue"
                                      : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {figure.influence} Impact
                          </span>
                        </div>

                        <h4
                          className={`font-serif ${
                            figure.featured ? "text-xl" : "text-lg"
                          } text-text-primary mb-1 font-bold`}
                        >
                          {figure.name}
                        </h4>
                        <p
                          className={`${
                            figure.featured ? "text-sm" : "text-xs"
                          } text-ocean-blue mb-3 font-medium`}
                        >
                          {figure.role}
                        </p>
                        <p
                          className={`${
                            figure.featured ? "text-base" : "text-sm"
                          } text-text-secondary mb-4`}
                        >
                          {figure.description}
                        </p>

                        <div>
                          <h5
                            className={`font-semibold ${
                              figure.featured ? "text-sm" : "text-xs"
                            } text-text-primary mb-2`}
                          >
                            Key Achievements:
                          </h5>
                          <ul
                            className={`${
                              figure.featured ? "text-sm" : "text-xs"
                            } text-text-secondary space-y-1`}
                          >
                            {(figure.featured
                              ? figure.achievements
                              : figure.achievements.slice(0, 2)
                            ).map((achievement, index) => (
                              <li key={index} className="flex items-start">
                                <StarIcon className="text-sunny-yellow mt-0.5 mr-2 h-3 w-3 flex-shrink-0" />
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: achievement,
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Evolution of Influence */}
          <section className="mt-16">
            <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
              The Evolution of Brava&rsquo;s Global Impact
            </h3>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="from-ocean-blue/10 to-ocean-blue/5 border-ocean-blue/20 rounded-lg border bg-gradient-to-br p-6 text-center shadow-sm">
                <MusicalNoteIcon className="text-ocean-blue mx-auto mb-3 h-10 w-10" />
                <h4 className="text-text-primary mb-2 font-semibold">
                  Cultural Foundation
                </h4>
                <p className="text-ocean-blue mb-2 text-xs font-medium">
                  1867-1930
                </p>
                <p className="text-text-secondary text-sm">
                  Eugénio Tavares and early masters established the artistic and
                  linguistic foundation that defines Cape Verdean identity.
                </p>
              </div>

              <div className="from-valley-green/10 to-valley-green/5 border-valley-green/20 rounded-lg border bg-gradient-to-br p-6 text-center shadow-sm">
                <svg
                  className="text-valley-green mx-auto mb-3 h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <h4 className="text-text-primary mb-2 font-semibold">
                  Political Awakening
                </h4>
                <p className="text-valley-green mb-2 text-xs font-medium">
                  1900-1975
                </p>
                <p className="text-text-secondary text-sm">
                  Intellectuals like Artur Silva translated cultural pride into
                  political action, contributing to national liberation.
                </p>
              </div>

              <div className="from-bougainvillea-pink/10 to-bougainvillea-pink/5 border-bougainvillea-pink/20 rounded-lg border bg-gradient-to-br p-6 text-center shadow-sm">
                <svg
                  className="text-bougainvillea-pink mx-auto mb-3 h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 className="text-text-primary mb-2 font-semibold">
                  Diaspora Expansion
                </h4>
                <p className="text-bougainvillea-pink mb-2 text-xs font-medium">
                  1880s-1960s
                </p>
                <p className="text-text-secondary text-sm">
                  Figures like &quot;Daddy&quot; Grace achieved extraordinary
                  global influence through migration and institution-building.
                </p>
              </div>

              <div className="from-sunny-yellow/10 to-sunny-yellow/5 border-sunny-yellow/20 rounded-lg border bg-gradient-to-br p-6 text-center shadow-sm">
                <svg
                  className="text-sunny-yellow mx-auto mb-3 h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h4 className="text-text-primary mb-2 font-semibold">
                  Contemporary Era
                </h4>
                <p className="text-sunny-yellow mb-2 text-xs font-medium">
                  1975-Present
                </p>
                <p className="text-text-secondary text-sm">
                  Modern leaders like David Soares maintain Brava&rsquo;s
                  tradition of disproportionate global influence and cultural
                  preservation.
                </p>
              </div>
            </div>
          </section>

          {/* Contemporary Community Leaders */}
          <section className="mt-16">
            <h3 className="text-text-primary mb-8 text-center font-serif text-2xl font-bold">
              Contemporary Guardians: Preserving Heritage and Community
            </h3>

            <div className="border-valley-green bg-valley-green/5 mb-6 rounded-lg border-l-4 p-4">
              <p className="text-text-secondary text-sm italic">
                <strong>Note:</strong> Contemporary community leaders whose work
                continues to unfold. Biographical details are based on community
                knowledge and are pending comprehensive documentation.
              </p>
            </div>

            <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-background-primary border-border-primary rounded-lg border p-6 shadow-sm">
                <h4 className="text-text-primary mb-3 text-lg font-semibold">
                  Eugenia Duarte
                </h4>
                <p className="text-ocean-blue mb-2 text-sm font-medium">
                  Community Activist & Healthcare Advocate
                </p>
                <p className="text-text-secondary mb-3 text-sm">
                  Brava native who became a powerful voice for island&apos;s
                  right to adequate medical services. Her viral advocacy
                  declaring "we may be the smallest island, but that doesn't
                  mean we deserve less" represents modern leadership focused on
                  fundamental community well-being.
                </p>
                <ul className="text-text-secondary space-y-1 text-xs">
                  <li>• Advocate for reliable medical facilities on Brava</li>
                  <li>• Champion of equal services for smallest island</li>
                  <li>• Voice for preventable death awareness</li>
                </ul>
              </div>

              <div className="bg-background-primary border-border-primary rounded-lg border p-6 shadow-sm">
                <h4 className="text-text-primary mb-3 text-lg font-semibold">
                  Carlos Bango
                </h4>
                <p className="text-valley-green mb-2 text-sm font-medium">
                  Conservationist & Environmental Leader
                </p>
                <p className="text-text-secondary mb-3 text-sm">
                  Native of Brava serving as Terrestrial Program Leader for
                  Biflores organization. Works to preserve the island&apos;s
                  unique biodiversity, understanding that Brava&apos;s culture
                  is inseparable from its environment and that conservation is
                  cultural preservation.
                </p>
                <ul className="text-text-secondary space-y-1 text-xs">
                  <li>• Terrestrial Program Leader for Biflores</li>
                  <li>
                    • Harmonizes human activities with ecosystem preservation
                  </li>
                  <li>
                    • Links environmental conservation to cultural heritage
                  </li>
                </ul>
              </div>

              <div className="bg-background-primary border-border-primary rounded-lg border p-6 shadow-sm">
                <h4 className="text-text-primary mb-3 text-lg font-semibold">
                  Candida Rose
                </h4>
                <p className="text-ocean-blue mb-2 text-sm font-medium">
                  Singer & Cultural Researcher
                </p>
                <p className="text-text-secondary mb-3 text-sm">
                  New Bedford-based singer and contributor to "Cabo Verdean
                  Women Writing Remembrance, Resistance and Revolution." Her
                  research traces the lineage of female musicians, actively
                  participating in the construction and preservation of Cape
                  Verdean cultural memory.
                </p>
                <ul className="text-text-secondary space-y-1 text-xs">
                  <li>• Researches lineage of Cape Verdean female musicians</li>
                  <li>
                    • Contributor to "Kriolas Poderozas" scholarly collection
                  </li>
                  <li>• Preserves diaspora cultural memory through music</li>
                </ul>
              </div>
            </div>

            <div className="from-valley-green/5 to-ocean-blue/5 border-valley-green rounded-lg border-l-4 bg-gradient-to-r p-6">
              <h4 className="text-text-primary mb-3 text-lg font-semibold">
                Holistic Heritage Preservation
              </h4>
              <p className="text-text-secondary">
                Today&apos;s leaders understand that cultural preservation is a
                holistic endeavor—honoring the past while fighting for the
                future, celebrating artistic achievement while ensuring the
                fundamental well-being of the community that produces it. As
                Brava navigates 21st-century challenges, its greatest resource
                remains the resilience, creativity, and profound love for
                homeland that defines its people.
              </p>
            </div>
          </section>
          {/* Explore More */}
          <section className="mt-16 text-center">
            <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
              Explore More Cultural Heritage
            </h3>
            <p className="text-text-secondary mb-6 text-lg">
              Learn more about the cultural context and historical background of
              these remarkable figures.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/history"
                className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
              >
                Explore History
              </Link>
              <Link
                href="/contribute"
                className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
              >
                Share Stories
              </Link>
            </div>
          </section>

          {/* Citation Section - don't split across pages */}
          <div className="break-inside-avoid">
            <CitationSection citations={citations} />
          </div>
          <BackToTopButton />
        </div>
      </div>
    </PrintPageWrapper>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "Brava Island Historical Figures: Global Influence",
    description:
      "Discover Brava's remarkable legacy: Eugénio Tavares, Marcelino 'Daddy' Grace, David Soares, and contemporary leaders achieving extraordinary global influence.",
    openGraph: {
      title:
        "The Brava Phenomenon: Era-Based Historical Figures & Contemporary Guardians",
      description:
        "Journey through Brava's historical eras: Cultural Foundation with Eugénio Tavares, Political Awakening with independence intellectuals, Diaspora Expansion featuring \"Daddy\" Grace's phenomenal influence, and Contemporary Era with David Soares, Eugenia Duarte, Carlos Bango, and modern heritage preservationists.",
      images: ["/images/people/brava-cultural-heritage.jpg"],
    },
    keywords:
      "Brava Island historical figures eras, Eugénio Tavares Cape Verde poet Cultural Foundation, Marcelino Daddy Grace United House Prayer Diaspora Expansion, Brava Phenomenon disproportionate influence levels, João José Dias Church Nazarene Africa, morna music origins Brava, Cape Verde cultural patriots Political Awakening, Artur Augusto da Silva independence intellectual, David Soares Albany District Attorney Contemporary Era, Adelina Domingues centenarian, Padre Pio Gottin missionary, Roosevelt Pires luthier Boston, Brava diaspora New England, whaling industry Cape Verde, sodade meaning longing, Crioulo literature language, Nhô Raul violinist traditional keeper, Ana Lúcia Ramos Lisboa filmmaker, Nilton Fernandes footballer global ambassador, Vila Nova Sintra cultural heritage, Vuca Pinheiro mandolin music contemporary, Gardenia Benrós traditional singer, Cape Verde smallest island biggest influence, Biflores conservation Brava, ethnobotany traditional knowledge, Eugenia Duarte healthcare advocate contemporary guardian, Carlos Bango environmental leader Biflores, Candida Rose singer cultural researcher, holistic heritage preservation, Revolutionary Phenomenal National Global Cultural influence levels, era-based organization historical progression",
  };
}
