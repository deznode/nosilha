import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { 
  MusicalNoteIcon, 
  StarIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for people content
export const revalidate = 7200;

// Historical figures organized chronologically by era and influence
const historicalEras = [
  {
    era: "Cultural Foundation",
    period: "1867-1930",
    description: "The birth of Cape Verdean cultural identity through literature and music",
    context: "This era saw the emergence of Cape Verde's distinct cultural voice, with Brava becoming the cradle of the nation's most emotional and enduring artistic expressions.",
    figures: [
      {
        name: "Eugénio Tavares",
        role: "Poet and Composer",
        category: "Literature & Music",
        years: "1867-1930",
        influence: "Revolutionary",
        description: "Cape Verde's definitive cultural patriarch who transformed morna from satirical to soulful, championing Crioulo as a literary language. His works define the nation's cultural identity and express the eternal theme of saudade.",
        achievements: [
          "Wrote the immortal morna 'Hora di Bai' (Time to Go)",
          "Published 'Mornas: Cantigas Crioulas' posthumously in 1932",
          "Founded Portuguese-language newspaper 'A Alvorada' in New Bedford",
          "Transformed morna from satirical to deeply emotional genre"
        ],
        image: "/images/people/eugenio-tavares.jpg",
        featured: true
      },
      {
        name: "Nhô Raul de Pina",
        role: "Master Violinist and Composer",
        category: "Music & Tradition",
        years: "Late 1800s-Early 1900s",
        influence: "Foundational",
        description: "Legendary violinist and composer from Brava who &lsquo;marked generations&rsquo; with his mastery. Though biographical details are scarce, his profound musical legacy lives on through family lineage and community memory.",
        achievements: [
          "Master violinist who influenced generations of musicians",
          "Composed traditional works that defined Brava's sound",
          "Preserved and transmitted classical morna techniques",
          "Created lasting musical legacy through family lineage"
        ],
        image: "/images/people/nho-raul-pina.jpg",
        featured: false
      }
    ]
  },
  {
    era: "Political Awakening",
    period: "1900-1975",
    description: "From cultural pride to political action and national liberation",
    context: "Building on Tavares's cultural foundation, this generation translated identity into political struggle, contributing directly to Cape Verde's independence movement.",
    figures: [
      {
        name: "Artur Augusto da Silva",
        role: "Writer and Independence Activist",
        category: "Literature & Politics",
        years: "1912-1983",
        influence: "Revolutionary",
        description: "Multifaceted intellectual who embodied the transition from cultural pride to political struggle. Close collaborator of Amílcar Cabral, he actively defended political prisoners and served as Supreme Court judge after independence.",
        achievements: [
          "Published poetry in the influential *Claridade* movement",
          "Close friend and collaborator of independence leader Amílcar Cabral",
          "Defended political prisoners against colonial oppression",
          "Served as Supreme Court judge in post-independence Guinea-Bissau"
        ],
        image: "/images/people/artur-silva.jpg",
        featured: true
      },
      {
        name: "João José Dias",
        role: "Religious Pioneer",
        category: "Faith & Mission",
        years: "fl. 1901",
        influence: "Global",
        description: "Bravan who converted to the Church of the Nazarene in America and returned to establish the first Church of the Nazarene in Africa. His mission from Brava spread across 44 African nations.",
        achievements: [
          "Founded first Church of the Nazarene in Africa on Brava (1901)",
          "Initiated religious movement that spread to 44 African nations",
          "Exemplified 'reverse mission' from diaspora back to homeland",
          "Street named in his honor in Nova Sintra"
        ],
        image: "/images/people/joao-dias.jpg",
        featured: false
      },
      {
        name: "Padre Pio Gottin",
        role: "Priest and Social Leader",
        category: "Faith & Community",
        years: "1924-1999",
        influence: "Community",
        description: "Italian Capuchin priest who served Brava for 24 years (1955-1979), remembered as &lsquo;father, missionary, educator, and friend.&rsquo; His &lsquo;Escola Materna&rsquo; fed over 300 children during severe droughts.",
        achievements: [
          "Served Brava community with dedication for 24 years",
          "Created &lsquo;Escola Materna&rsquo; feeding 300+ children during famines",
          "Founded Congregation of Franciscan Sisters of Immaculate Conception",
          "Beloved community leader during critical development period"
        ],
        image: "/images/people/padre-pio.jpg",
        featured: false
      }
    ]
  },
  {
    era: "Diaspora Expansion",
    period: "1880s-1960s",
    description: "Global influence through migration and cultural preservation",
    context: "Bravans leveraged diaspora networks to achieve extraordinary international influence, creating lasting institutions and preserving cultural traditions across continents.",
    figures: [
      {
        name: "Marcelino 'Daddy' Grace",
        role: "Religious Leader and Entrepreneur",
        category: "Faith & Business",
        years: "c.1881-1960",
        influence: "Phenomenal",
        description: "Born Marcelino Manuel da Graça on Brava, became 'Sweet Daddy' Grace, founder of United House of Prayer for All People. Built spiritual and economic empire with millions of followers and vast real estate holdings.",
        achievements: [
          "Founded major African-American Christian denomination (1919)",
          "Built spiritual empire with hundreds of churches nationwide",
          "Accumulated vast real estate holdings including hotels and apartments",
          "Counted millions of followers by his death"
        ],
        image: "/images/people/daddy-grace.jpg",
        featured: true
      },
      {
        name: "Adelina Domingues",
        role: "Centenarian and Missionary",
        category: "Faith & Longevity",
        years: "1888-2002",
        influence: "Inspirational",
        description: "Born on Brava, emigrated to Massachusetts in 1907 and lived 114 years, becoming the world's oldest person. Active missionary for Church of the Nazarene, connecting back to Brava's spiritual legacy.",
        achievements: [
          "Lived 114 years and 183 days - world's oldest person at death",
          "Active missionary for Church of the Nazarene",
          "Embodied resilience spanning three centuries",
          "Symbol of Bravense longevity and faith"
        ],
        image: "/images/people/adelina-domingues.jpg",
        featured: false
      },
      {
        name: "Ivo Pires",
        role: "Master Luthier",
        category: "Traditional Crafts",
        years: "1942-2009",
        influence: "Cultural",
        description: "Self-taught master craftsman who emigrated to Boston in 1967, bringing traditional Bravense instrument-making skills to America. Professionalized his craft and passed knowledge to his son Roosevelt.",
        achievements: [
          "Master luthier who brought Bravense craft to America",
          "Established professional workshop and reputation in Boston",
          "Preserved and refined traditional instrument-making techniques",
          "Founded dynasty continuing through son Roosevelt"
        ],
        image: "/images/people/ivo-pires.jpg",
        featured: false
      }
    ]
  },
  {
    era: "Contemporary Era",
    period: "1975-Present",
    description: "Modern leadership and cultural preservation in the global age",
    context: "Contemporary figures continue Brava's legacy of disproportionate influence, from American politics to international cultural preservation, maintaining connections between island and diaspora.",
    figures: [
      {
        name: "David Soares",
        role: "District Attorney and Legal Reformer",
        category: "Law & Politics",
        years: "b.1969",
        influence: "National",
        description: "Born on Brava, raised in Rhode Island, became long-serving District Attorney for Albany County, New York. Gained national reputation as progressive prosecutor challenging harsh drug laws and government corruption.",
        achievements: [
          "Long-serving District Attorney with national reputation",
          "Progressive prosecutor challenging Rockefeller drug laws",
          "High-profile government integrity cases",
          "Cornell University and Albany Law School graduate"
        ],
        image: "/images/people/david-soares.jpg",
        featured: true
      },
      {
        name: "Roosevelt Pires",
        role: "Master Craftsman",
        category: "Arts & Heritage",
        years: "Contemporary",
        influence: "Cultural",
        description: "Continues his father's legendary instrument-making tradition at South End String Instrument in Boston. Represents the living bridge between Brava's cultural heritage and global artistry, working on instruments for world-renowned musicians.",
        achievements: [
          "Maintains family tradition of master luthiers from Brava",
          "Creates instruments for professional musicians including Yo-Yo Ma",
          "Bridges traditional Bravense craftsmanship with modern techniques",
          "Preserves and shares cultural heritage through artisanship"
        ],
        image: "/images/people/roosevelt-pires.jpg",
        featured: false
      },
      {
        name: "Vuca Pinheiro",
        role: "Musician and Cultural Preservationist",
        category: "Music & Heritage",
        years: "Contemporary",
        influence: "Cultural",
        description: "Contemporary singer, composer, and instrumentalist explicitly dedicated to preserving Brava's musical heritage. His 2023 albums directly honor Eugénio Tavares and revive the island's mandolin traditions.",
        achievements: [
          "Released *Ilha Brava Ilha Formosa* featuring Tavares's 'Hino Bravense'",
          "Revived island's mandolin tradition with *Bandolins da Ilha Brava*",
          "Preserves and performs traditional Bravense music internationally",
          "Bridges historical and contemporary musical expression"
        ],
        image: "/images/people/vuca-pinheiro.jpg",
        featured: false
      },
      {
        name: "Ana Lúcia Ramos Lisboa",
        role: "Film Director and Historian",
        category: "Film & Documentation",
        years: "Contemporary",
        influence: "Cultural",
        description: "Film director born in Furna who documents Cape Verde's independence history. Her work on Amílcar Cabral and national identity brings Brava's contribution to liberation full circle through cinema.",
        achievements: [
          "Directed acclaimed documentary on independence leader Amílcar Cabral",
          "Created *Cabo Verde nha cretcheu* exploring national identity",
          "Uses Cape Verdean landscapes to explore democratic principles",
          "Historicizes revolution that figures like Artur Silva participated in"
        ],
        image: "/images/people/ana-lisboa.jpg",
        featured: false
      }
    ]
  }
];

// Flatten all figures for easier filtering
const historicalFigures = historicalEras.flatMap(era => era.figures);

export default function PeoplePage() {

  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Historical Figures"
          subtitle="Discover the remarkable people who shaped Brava Island's rich cultural heritage and continue to inspire generations."
        />

        {/* Introduction Section */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-4">
                Souls of Brava: From Poets to Patriots
              </h2>
              <p className="text-lg text-text-secondary mb-4">
                Brava Island, though small in size, has produced an extraordinary constellation 
                of individuals whose contributions echo far beyond its shores. From the immortal 
                verses of Eugénio Tavares to the skilled hands of the Pires family luthiers, 
                from Captain Antonio Jose Coelho's pioneering leadership in the diaspora to 
                contemporary voices like Gardenia Benrós preserving musical traditions.
              </p>
              <p className="text-text-secondary">
                These remarkable souls embody the spirit of Brava—creative, resilient, 
                and deeply connected to both home and the wider world. Their stories span 
                centuries, linking the island's volcanic origins to its vibrant global 
                diaspora, weaving a tapestry of cultural heritage that continues to inspire.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/people/brava-cultural-heritage.jpg"
                alt="Cultural heritage of Brava Island showing traditional life and customs"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Historical Timeline Overview */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Historical Progression of Influence
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ocean-blue via-valley-green to-bougainvillea-pink"></div>
            
            <div className="space-y-8">
              {historicalEras.map((era, index) => (
                <div key={era.era} className="relative flex items-start">
                  {/* Timeline Dot */}
                  <div className="w-8 h-8 rounded-full bg-ocean-blue flex items-center justify-center text-white text-sm font-bold relative z-10">
                    {index + 1}
                  </div>
                  
                  {/* Era Content */}
                  <div className="ml-6 bg-background-primary p-4 rounded-lg shadow-sm border border-border-primary flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-serif text-lg font-bold text-text-primary">
                        {era.era}
                      </h4>
                      <span className="text-sm text-ocean-blue font-medium bg-ocean-blue/10 px-2 py-1 rounded">
                        {era.period}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-3">{era.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {era.figures.filter(f => f.featured).map((figure) => (
                        <span key={figure.name} className="text-xs bg-valley-green/10 text-valley-green px-2 py-1 rounded">
                          {figure.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Historical Eras */}
        {historicalEras.map((era, eraIndex) => (
          <section key={era.era} className="mt-16">
            {/* Era Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-ocean-blue/10 flex items-center justify-center mr-4">
                  <span className="text-ocean-blue font-bold text-lg">{eraIndex + 1}</span>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-text-primary">
                    {era.era} ({era.period})
                  </h3>
                  <p className="text-text-secondary font-medium">{era.description}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-ocean-blue/5 to-valley-green/5 p-4 rounded-lg border-l-4 border-ocean-blue">
                <p className="text-text-secondary italic">{era.context}</p>
              </div>
            </div>

            {/* Era Figures */}
            <div className="space-y-8">
              {era.figures.map((figure) => (
                <div key={figure.name} className={`grid gap-6 lg:grid-cols-${figure.featured ? '2' : '1'} ${
                  figure.featured 
                    ? 'bg-background-primary p-6 rounded-lg shadow-sm border border-border-primary' 
                    : 'bg-background-primary/50 p-4 rounded-lg'
                }`}>
                  {figure.featured && (
                    <div className="relative h-64 lg:h-80">
                      <Image
                        src={figure.image}
                        alt={`Portrait of ${figure.name}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className={figure.featured ? '' : 'flex items-start space-x-4'}>
                    {!figure.featured && (
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={figure.image}
                          alt={`Portrait of ${figure.name}`}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xs bg-ocean-blue/10 text-ocean-blue px-2 py-1 rounded">
                          {figure.category}
                        </span>
                        <span className="text-xs text-text-secondary ml-2 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {figure.years}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ml-2 ${
                          figure.influence === 'Revolutionary' ? 'bg-bougainvillea-pink/10 text-bougainvillea-pink' :
                          figure.influence === 'Phenomenal' ? 'bg-sunny-yellow/10 text-sunny-yellow' :
                          figure.influence === 'National' ? 'bg-valley-green/10 text-valley-green' :
                          figure.influence === 'Global' ? 'bg-ocean-blue/20 text-ocean-blue' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {figure.influence} Impact
                        </span>
                      </div>
                      
                      <h4 className={`font-serif ${figure.featured ? 'text-xl' : 'text-lg'} font-bold text-text-primary mb-1`}>
                        {figure.name}
                      </h4>
                      <p className={`${figure.featured ? 'text-sm' : 'text-xs'} text-ocean-blue font-medium mb-3`}>
                        {figure.role}
                      </p>
                      <p className={`${figure.featured ? 'text-base' : 'text-sm'} text-text-secondary mb-4`}>
                        {figure.description}
                      </p>
                      
                      <div>
                        <h5 className={`font-semibold ${figure.featured ? 'text-sm' : 'text-xs'} text-text-primary mb-2`}>
                          Key Achievements:
                        </h5>
                        <ul className={`${figure.featured ? 'text-sm' : 'text-xs'} text-text-secondary space-y-1`}>
                          {(figure.featured ? figure.achievements : figure.achievements.slice(0, 2)).map((achievement, index) => (
                            <li key={index} className="flex items-start">
                              <StarIcon className="h-3 w-3 text-sunny-yellow mr-2 mt-0.5 flex-shrink-0" />
                              <span dangerouslySetInnerHTML={{ __html: achievement }} />
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
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            The Evolution of Brava&rsquo;s Global Impact
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gradient-to-br from-ocean-blue/10 to-ocean-blue/5 p-6 rounded-lg shadow-sm text-center border border-ocean-blue/20">
              <MusicalNoteIcon className="h-10 w-10 text-ocean-blue mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Cultural Foundation</h4>
              <p className="text-xs text-ocean-blue font-medium mb-2">1867-1930</p>
              <p className="text-sm text-text-secondary">
                Eugénio Tavares and early masters established the artistic and linguistic foundation that defines Cape Verdean identity.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-valley-green/10 to-valley-green/5 p-6 rounded-lg shadow-sm text-center border border-valley-green/20">
              <svg className="h-10 w-10 text-valley-green mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h4 className="font-semibold text-text-primary mb-2">Political Awakening</h4>
              <p className="text-xs text-valley-green font-medium mb-2">1900-1975</p>
              <p className="text-sm text-text-secondary">
                Intellectuals like Artur Silva translated cultural pride into political action, contributing to national liberation.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-bougainvillea-pink/10 to-bougainvillea-pink/5 p-6 rounded-lg shadow-sm text-center border border-bougainvillea-pink/20">
              <svg className="h-10 w-10 text-bougainvillea-pink mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-semibold text-text-primary mb-2">Diaspora Expansion</h4>
              <p className="text-xs text-bougainvillea-pink font-medium mb-2">1880s-1960s</p>
              <p className="text-sm text-text-secondary">
                Figures like &quot;Daddy&quot; Grace achieved extraordinary global influence through migration and institution-building.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-sunny-yellow/10 to-sunny-yellow/5 p-6 rounded-lg shadow-sm text-center border border-sunny-yellow/20">
              <svg className="h-10 w-10 text-sunny-yellow mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h4 className="font-semibold text-text-primary mb-2">Contemporary Era</h4>
              <p className="text-xs text-sunny-yellow font-medium mb-2">1975-Present</p>
              <p className="text-sm text-text-secondary">
                Modern leaders like David Soares maintain Brava&rsquo;s tradition of disproportionate global influence and cultural preservation.
              </p>
            </div>
          </div>
        </section>

        {/* Legacy Section */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6 text-center">
            Living Legacy
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <h4 className="font-semibold text-lg text-text-primary mb-2">
                Cultural Preservation
              </h4>
              <p className="text-text-secondary">
                These figures established traditions of cultural preservation that continue 
                today through festivals, storytelling, and artistic expression.
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-lg text-text-primary mb-2">
                International Recognition
              </h4>
              <p className="text-text-secondary">
                Their contributions helped establish Cape Verde's reputation as a nation 
                rich in cultural heritage and artistic achievement.
              </p>
            </div>
          </div>
        </section>

        {/* Explore More */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Explore More Cultural Heritage
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Learn more about the cultural context and historical background of these remarkable figures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/history"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Explore History
            </Link>
            <Link
              href="/media/music"
              className="rounded-md border-2 border-valley-green px-6 py-3 text-base font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              Music & Arts
            </Link>
            <Link
              href="/contribute"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
            >
              Share Stories
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
    title: 'Historical Figures of Brava Island | Nos Ilha',
    description: 'Discover the remarkable people who shaped Brava Island\'s rich cultural heritage, from poets and musicians to storytellers and community leaders.',
    openGraph: {
      title: 'Historical Figures - Brava Island',
      description: 'Learn about the notable figures who contributed to Cape Verde\'s cultural identity and Brava Island\'s heritage.',
      images: ['/images/people/brava-cultural-heritage.jpg'],
    },
  };
}