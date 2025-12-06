/**
 * English content for the History page
 *
 * This file contains all translatable content for the history page.
 * To add a new language, copy this file to e.g., pt.ts and translate the strings.
 */

import type { HistoryPageData } from "./types";

export const historyData: HistoryPageData = {
  metadata: {
    title: "History & Heritage: Brava Island",
    description:
      "Discover the rich cultural tapestry and fascinating history of Brava Island, from its volcanic origins to its vibrant musical traditions.",
    publishDate: "2025-01-20",
    updatedDate: "2025-01-24",
    author: "Nosilha Team",
    category: "history",
    tags: [
      "history",
      "culture",
      "volcanic-origins",
      "eugénio-tavares",
      "morna-music",
      "whaling-heritage",
    ],
    language: "en",
    slug: "history",
    keywords:
      "Brava Island history video, Cape Verde cultural heritage VideoHeroSection, Eugénio Tavares poet, morna music origins, sodade meaning, 1680 Fogo migration, American whaling industry, Cape Verdean diaspora, New Bedford connections, Brava Crioulo literature, Island of Flowers, volcanic stratovolcano, transnational community, Vila Nova Sintra video, packet trade era, Brava maritime heritage, Cape Verde smallest island, 2004 airport closure, cloud water collection projects, contemporary preservation, whaling heritage, cultural flowering period, geological foundations",
    openGraph: {
      title:
        "Brava Island: Complete Cultural History with Video Journey - Wild Island, Tender Soul",
      description:
        "Experience Brava's remarkable story: volcanic formation, Great Migration of 1680, Eugénio Tavares and morna music, transnational whaling era, contemporary innovation with cloud water collection, and living legacy of sodade. Features immersive video storytelling from Vila Nova Sintra.",
      images: ["/images/history/brava-overview.jpg"],
    },
  },

  hero: {
    videoSrc: "/images/history/brava-overview.mp4",
    title: "Our Island, Our Story: The History of Brava",
    subtitle:
      "From Vila Nova Sintra's heights, discover the rich tapestry of Brava Island",
  },

  sections: [
    {
      title: "Volcanic Foundations",
      description: "The geological birth of an ancient stratovolcano",
      icon: "GlobeAltIcon",
      content:
        "Brava is fundamentally a geological creation of fire and sea—an ancient stratovolcano rising from the ocean floor. Though appearing as a separate landmass, it remains physically connected beneath the surface to the colossal volcano of neighboring Fogo, making it geologically part of the same immense structure. This submarine formation began 2-3 million years ago, with explosive sub-aerial volcanism occurring around 250,000 years ago, creating the dramatic landscape of steep cliffs and fertile valleys that defines the island today.",
      image: "/images/history/brava-formation.jpg",
      imageCourtesy: "Nosilha.com",
    },
    {
      title: "Cultural Flowering",
      description: "The birthplace of morna music and Crioulo literature",
      icon: "MusicalNoteIcon",
      content:
        "Brava transformed from a place of refuge into the cultural heart of Cape Verde. Here, Eugénio Tavares revolutionized the morna from satirical to soulful, creating the emotional template for the nation's music. His pioneering use of Brava Crioulo as a literary language elevated the vernacular to high art, giving voice to the universal Cape Verdean experience of *sodade*—the profound longing that defines the diaspora experience. The island's cultural contributions far exceed its small size, earning it recognition as the 'Island of Flowers'.",
      image: "/images/history/brava-culture.webp",
      imageCourtesy: "Cabo Verde & a Música",
    },
    {
      title: "Transnational Community",
      description: "Whaling industry connections forging Atlantic bridges",
      icon: "ClockIcon",
      content:
        "The American whaling industry transformed Brava from an isolated Portuguese colony into a transnational community. Yankee whaling captains, impressed by Bravense maritime skills, recruited local men for voyages to Pacific hunting grounds. This connection created the 'Brava Packet Trade'—regular ship service between the island and New England ports, carrying passengers, mail, cargo, and crucial remittances. For over a century, whaling became Brava's principal industry, establishing permanent bonds with Massachusetts communities that continue today.",
      image: "/images/history/brava-maritime.jpg",
      imageCourtesy: "the New Bedford Whaling Museum",
    },
  ],

  figures: [
    {
      name: "Eugénio Tavares",
      role: "Cultural Patriarch and Revolutionary",
      years: "1867-1930",
      description:
        "Cape Verde's definitive cultural figure who transformed morna 'from laughter to weeping,' pioneering Crioulo as a literary language. His exile in New Bedford (1900-1910) intensified his connection to *sodade*, creating the emotional template for Cape Verdean identity. Founded newspapers in both America and Cape Verde, using journalism as cultural and political resistance.",
    },
    {
      name: "Marcelino 'Daddy' Grace",
      role: "Religious Entrepreneur and Institution Builder",
      years: "1881-1960",
      description:
        "Born Marcelino Manuel da Graça on Brava, became 'Sweet Daddy' Grace, founder of United House of Prayer for All People. From a $39 tent in Massachusetts, he built one of the largest African-American religious denominations with 3+ million followers and a $25 million empire. Exemplifies the spectacular scale of Brava's diaspora influence and institutional leadership.",
    },
    {
      name: "The Pires Family Legacy",
      role: "Master Luthiers Across Generations",
      years: "1942-Present",
      description:
        "From Ivo Pires, the self-taught master who brought traditional Bravense instrument-making to Boston in 1967, to his son Roosevelt who continues the craft at South End String Instrument, creating instruments for world-renowned musicians including Yo-Yo Ma. They represent the living transmission of cultural heritage through artisanship.",
    },
  ],

  timeline: [
    {
      date: "1462",
      title: "Discovery",
      description:
        "Brava Island is discovered by Portuguese navigators during the Age of Exploration.",
    },
    {
      date: "1680",
      title: "The Great Migration",
      description:
        "Mount Fogo's catastrophic eruption forces a mass exodus from the neighboring island. Brava, with its fertile valleys and fresh water, becomes the primary sanctuary for refugees, establishing the demographic foundation of its society through an act of collective compassion rather than conquest.",
    },
    {
      date: "1774",
      title: "The Great Famine",
      description:
        "A catastrophic drought and famine devastates Brava and Fogo, causing widespread death and desperation. This crisis marks the beginning of systematic emigration to America as a survival strategy, establishing patterns that would define Brava's relationship with the wider world for centuries to come.",
    },
    {
      date: "Late 1700s",
      title: "The Whaling Connection",
      description:
        "American whaling ships from New England begin using Brava's sheltered harbors at Fajã de Água and Furna as provisioning stops on trans-Atlantic routes to Pacific hunting grounds. Impressed by Bravense maritime skills, Yankee captains begin systematic recruitment, creating the foundation for over a century of transnational community.",
    },
    {
      date: "1800s",
      title: "Packet Trade Era",
      description:
        "The 'Brava Packet Trade' formalizes emigration patterns, with ships carrying passengers, mail, and goods between Brava and New England ports, creating a vital transnational lifeline.",
    },
    {
      date: "1867",
      title: "Birth of Eugénio Tavares",
      description:
        "Birth of Cape Verde's most celebrated poet and composer, who would transform the morna musical genre and champion Crioulo as a literary language.",
    },
    {
      date: "1900-1910",
      title: "Tavares in Political Exile",
      description:
        "Facing persecution for his journalism criticizing Portuguese colonial injustices, Eugénio Tavares is forced into exile in New Bedford. Rather than silencing him, this exile internationalizes his voice. He founds 'A Alvorada' (Dawn), the first Portuguese-language newspaper in the United States, and writes his most poignant mornas about *sodade* and separation.",
    },
    {
      date: "1932",
      title: "Literary Immortality",
      description:
        "Publication of 'Mornas: Cantigas Crioulas,' Tavares's posthumous collection that becomes the foundational text of Cape Verdean literature. His poem 'Morna de Aguada' later appears on the 2000 escudo banknote alongside his portrait, cementing his status as the nation's cultural patriarch.",
    },
    {
      date: "1975",
      title: "Independence & Cultural Continuity",
      description:
        "Cape Verde gains independence from Portugal, with Brava's cultural contributions—the morna, Crioulo literature, and the concept of *sodade*—now recognized as pillars of national identity. The island continues its role as cultural beacon while maintaining its unique transnational character.",
    },
    {
      date: "2004-Present",
      title: "Modern Challenges & Innovation",
      description:
        "Brava's airport closes permanently due to dangerous crosswinds, leaving the island entirely dependent on ferry service and reinforcing its isolation. Yet this challenge sparks innovation: cloud water collection projects leverage the island's unique microclimate, while contemporary artists like Vuca Pinheiro explicitly honor Eugénio Tavares, and the diaspora continues producing leaders like District Attorney David Soares.",
    },
  ],

  iconGridItems: [
    {
      icon: "musical-note",
      title: "The Brava Morna",
      description:
        'Brava pioneered the definitive morna style—slow tempo (around 60 beats per minute), romantic themes, and accentuated lyricism rooted in 19th-century Romanticism. Eugénio Tavares transformed it "from laughter to weeping," codifying sodade as the emotional core of Cape Verdean identity. This musical form became the nation\'s most powerful cultural export.',
      iconColor: "ocean-blue",
    },
    {
      icon: "book-open",
      title: "Crioulo Literature",
      description:
        "Brava was the birthplace of Cape Verdean literature in the vernacular. Tavares pioneered writing in Brava Crioulo, elevating the people's language to high art and literary prestige. This radical act validated Cape Verdean cultural identity and inspired generations of writers to celebrate their distinct linguistic heritage.",
      iconColor: "valley-green",
    },
    {
      icon: "globe-alt",
      title: "Transnational Identity",
      description:
        "Brava's unique identity transcends geography—it exists simultaneously in Cape Verde and New England. This hyphenated identity, forged through whaling and maintained through family ties, remittances, and cultural exchange, creates communities that are neither fully Cape Verdean nor American, but uniquely Bravan.",
      iconColor: "bougainvillea-pink",
    },
  ],

  statisticsData: [
    {
      value: "~6,000",
      label: "Island Residents",
      description: "Smallest inhabited island",
      color: "ocean-blue",
    },
    {
      value: "250+",
      label: "Years of Diaspora",
      description: "Since 1774 Great Famine",
      color: "valley-green",
    },
    {
      value: "1867",
      label: "Tavares Born",
      description: "Cultural foundation year",
      color: "bougainvillea-pink",
    },
    {
      value: "Global",
      label: "Cultural Impact",
      description: "Beyond island's size",
      color: "sunny-yellow",
    },
  ],

  citations: [
    // Geological & Formation Sources
    {
      source:
        "Volcano-stratigraphic and structural evolution of Brava Island (Cape Verde) based on 40Ar/39Ar, U–Th and field constraints",
      author: "ResearchGate",
      year: 2025,
      url: "https://www.researchgate.net/publication/248257199_Volcano-stratigraphic_and_structural_evolution_of_Brava_Island_Cape_Verde_based_on_40Ar39Ar_U-Th_and_field_constraints",
    },
    {
      source: "Volcano-tectonic structure of Brava Island (Cape Verde)",
      author: "ResearchGate",
      year: 2025,
      url: "https://www.researchgate.net/publication/257426859_Volcano-tectonic_structure_of_Brava_Island_Cape_Verde",
    },
    {
      source: "Brava - Smithsonian Institution Global Volcanism Program",
      author: "Smithsonian Institution",
      year: 2025,
      url: "https://volcano.si.edu/volcano.cfm?vn=384020",
    },
    {
      source:
        "Anthropogenic transitions from forested to human-dominated landscapes in southern Macaronesia",
      author: "PNAS",
      year: 2025,
      url: "https://www.pnas.org/doi/10.1073/pnas.2022215118",
    },
    {
      source:
        "Tracing human impacts on the islands of Cabo Verde: Palaeoecology for the conservation of island ecosystems",
      author: "ResearchGate",
      year: 2025,
      url: "https://www.researchgate.net/publication/363365368_Tracing_human_impacts_on_the_islands_of_Cabo_Verde_Palaeoecology_for_the_conservation_of_island_ecosystems",
    },
    // Historical & Migration Sources
    {
      source: "Cape Verde: Brava - Portuguese Historical Museum",
      author: "Portuguese Historical Museum",
      year: 2025,
      url: "https://portuguesemuseum.org/?page_id=1808&category=3&event=325",
    },
    {
      source:
        "Brushstrokes in the past: Parish of Nossa Senhora do Monte, its origins, its past and its history",
      author: "Brava News",
      year: 2025,
      url: "https://www.brava.news/en/brushstrokes-in-the-past-freguesia-of-nossa-senhora-do-monte-its-origins-its-past-and-its-history",
    },
    {
      source: "Cape Verdean Americans",
      author: "Wikipedia",
      year: 2025,
      url: "https://en.wikipedia.org/wiki/Cape_Verdean_Americans",
    },
    {
      source: "Cape Verdean American Packet Trade - The Schooner Ernestina",
      author: "Schooner Ernestina Archive",
      year: 2025,
      url: "http://www.archive.ernestina.org/history/Tchuba/tchuba-4.pdf",
    },
    {
      source:
        "The Cape Verdean nation is a product of human mobility, and migration has continued",
      author: "Jørgen Carling",
      year: 2025,
      url: "https://jorgencarling.org/wp-content/uploads/2019/02/carling-and-c385kesson-2009-mobility-at-the-heart-of-a-nation.pdf",
    },
    {
      source:
        "Cabo Verde - Independence Struggle, Colonization, Decolonization",
      author: "Britannica",
      year: 2025,
      url: "https://www.britannica.com/place/Cabo-Verde/Struggle-for-independence",
    },
    // Cultural & Musical Heritage Sources
    {
      source: "Morna - Cabo Verde",
      author: "caboverde-info.com",
      year: 2025,
      url: "https://www.caboverde-info.com/eng/Identity/Culture/Morna",
    },
    {
      source: "The Morna of Eugénio Tavares - Cabo Verde",
      author: "caboverde-info.com",
      year: 2025,
      url: "https://www.caboverde-info.com/eng/Identity/Culture/The-Morna-of-Eugenio-Tavares",
    },
    {
      source: "A Voyage Around the World - New Bedford Whaling Museum",
      author: "New Bedford Whaling Museum",
      year: 2025,
      url: "https://www.whalingmuseum.org/exhibition/a-voyage-around-the-world/",
    },
    {
      source: "Timeline - The Cape Cod Cape Verdean Museum & Cultural Center",
      author: "Cape Cod Cape Verdean Museum",
      year: 2025,
      url: "http://www.capecodcvmuseum.org/timeline",
    },
    // Contemporary & Modern Sources
    {
      source: "Cloud-moisture harvesting to combat hydroclimatic risk",
      author: "UNESCO",
      year: 2025,
      url: "https://www.unesco.org/en/articles/cloud-moisture-harvesting-combat-hydroclimatc-risk",
    },
    {
      source:
        "A new road for safety, development, and tourism on a seismic island",
      author: "World Bank",
      year: 2025,
      url: "https://www.worldbank.org/en/news/feature/2023/02/23/cabo-verde-a-new-road-for-safety-development-and-tourism-on-a-seismic-island",
    },
    {
      source: "Ilha Brava: 50 Years of Independence, a stifled hope",
      author: "Brava News",
      year: 2025,
      url: "https://www.brava.news/en/ilha-brava-50-years-of-independence-a-suffocated-hope",
    },
    // Additional Academic Sources
    {
      source:
        "A genetic and linguistic analysis of the admixture histories of the islands of Cabo Verde",
      author: "eLife Sciences",
      year: 2025,
      url: "https://elifesciences.org/articles/79827",
    },
    {
      source: "Survey chapter: Cape Verdean Creole of Brava",
      author: "APiCS Online",
      year: 2025,
      url: "https://apics-online.info/surveys/31",
    },
  ],
};
