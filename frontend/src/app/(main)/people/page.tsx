import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { 
  MusicalNoteIcon, 
  BookOpenIcon, 
  AcademicCapIcon,
  PencilIcon,
  StarIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for people content
export const revalidate = 7200;

// Historical figures data (in a real implementation, this would come from the API)
const historicalFigures = [
  {
    name: "Eugénio Tavares",
    role: "Poet and Composer",
    category: "Literature & Music",
    years: "1867-1930",
    description: "One of Cape Verde's most celebrated poets and composers, known for his mornas and romantic poetry. His work captured the essence of Cape Verdean saudade and the experience of emigration.",
    achievements: [
      "Wrote the famous morna 'Hora di Bai' (Time to Go)",
      "Published poetry collections including 'Mornas: Cantigas Crioulas'",
      "Considered the father of Cape Verdean literature",
      "His work influenced generations of Cape Verdean artists"
    ],
    image: "/images/people/eugenio-tavares.jpg",
    featured: true
  },
  {
    name: "Nhô Djunga",
    role: "Traditional Musician",
    category: "Music & Culture",
    years: "1890-1975",
    description: "A master of traditional Brava music who preserved and transmitted the island's musical heritage through generations. Known for his skill with traditional instruments and oral tradition.",
    achievements: [
      "Preserved traditional Brava musical styles",
      "Taught music to countless young people",
      "Maintained oral musical traditions",
      "Influenced the development of Cape Verdean music"
    ],
    image: "/images/people/nho-djunga.jpg",
    featured: true
  },
  {
    name: "Corsino Fortes",
    role: "Poet and Diplomat",
    category: "Literature & Politics",
    years: "1933-2015",
    description: "A distinguished poet and diplomat from Brava who served as Cape Verde's ambassador to Portugal. His poetry explored themes of identity, diaspora, and the Cape Verdean experience.",
    achievements: [
      "Published acclaimed poetry collections",
      "Served as Cape Verde's ambassador to Portugal",
      "Contributed to Cape Verdean literary renaissance",
      "Promoted Cape Verdean culture internationally"
    ],
    image: "/images/people/corsino-fortes.jpg",
    featured: false
  },
  {
    name: "Nha Nasia Gomi",
    role: "Traditional Storyteller",
    category: "Oral Tradition",
    years: "1920-2010",
    description: "A renowned storyteller who preserved Brava's oral traditions, legends, and folk tales. Her stories were passed down through generations and kept the island's cultural memory alive.",
    achievements: [
      "Preserved traditional Brava folk tales",
      "Maintained oral historical traditions",
      "Inspired local cultural preservation efforts",
      "Mentored younger generations in storytelling"
    ],
    image: "/images/people/nha-nasia-gomi.jpg",
    featured: false
  },
  {
    name: "Ti Goi",
    role: "Traditional Craftsman",
    category: "Arts & Crafts",
    years: "1925-2005",
    description: "A master craftsman who specialized in traditional Brava handicrafts, including basket weaving and woodworking. His work represented the island's artisanal traditions.",
    achievements: [
      "Mastered traditional basket weaving techniques",
      "Created functional art from local materials",
      "Taught traditional crafts to young people",
      "Preserved artisanal knowledge and techniques"
    ],
    image: "/images/people/ti-goi.jpg",
    featured: false
  },
  {
    name: "Dona Bibinha",
    role: "Community Leader",
    category: "Community & Culture",
    years: "1935-2020",
    description: "A respected community leader who organized cultural events and preserved traditional celebrations. She was instrumental in maintaining Brava's cultural identity.",
    achievements: [
      "Organized traditional festivals and celebrations",
      "Led community cultural preservation efforts",
      "Mentored women in traditional roles",
      "Maintained cultural practices and customs"
    ],
    image: "/images/people/dona-bibinha.jpg",
    featured: false
  }
];

export default function PeoplePage() {
  const featuredFigures = historicalFigures.filter(figure => figure.featured);
  const otherFigures = historicalFigures.filter(figure => !figure.featured);

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
                Voices of Brava
              </h2>
              <p className="text-lg text-text-secondary mb-4">
                Throughout its history, Brava Island has been home to extraordinary individuals 
                who have contributed to Cape Verde's cultural identity. From poets and musicians 
                to storytellers and craftsmen, these figures have preserved and enriched the 
                island's heritage.
              </p>
              <p className="text-text-secondary">
                Their legacy continues to influence Cape Verdean culture today, inspiring new 
                generations of artists, writers, and cultural preservationists both on the 
                island and in diaspora communities worldwide.
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

        {/* Featured Figures */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
            Notable Figures
          </h3>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {featuredFigures.map((figure) => (
              <div key={figure.name} className="bg-background-primary rounded-lg shadow-sm overflow-hidden">
                <div className="relative h-64">
                  <Image
                    src={figure.image}
                    alt={`Portrait of ${figure.name}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="text-xs bg-ocean-blue/10 text-ocean-blue px-2 py-1 rounded">
                      {figure.category}
                    </span>
                    <span className="text-xs text-text-secondary ml-2 flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {figure.years}
                    </span>
                  </div>
                  
                  <h4 className="font-serif text-xl font-bold text-text-primary mb-1">
                    {figure.name}
                  </h4>
                  <p className="text-sm text-ocean-blue font-medium mb-3">
                    {figure.role}
                  </p>
                  <p className="text-text-secondary mb-4">
                    {figure.description}
                  </p>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold text-sm text-text-primary mb-2">
                      Key Achievements:
                    </h5>
                    <ul className="text-sm text-text-secondary space-y-1">
                      {figure.achievements.slice(0, 3).map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <StarIcon className="h-3 w-3 text-sunny-yellow mr-2 mt-0.5 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Notable Figures */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
            Other Notable Figures
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {otherFigures.map((figure) => (
              <div key={figure.name} className="bg-background-primary p-6 rounded-lg shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={figure.image}
                      alt={`Portrait of ${figure.name}`}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-xs bg-valley-green/10 text-valley-green px-2 py-1 rounded">
                        {figure.category}
                      </span>
                      <span className="text-xs text-text-secondary ml-2">
                        {figure.years}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg text-text-primary mb-1">
                      {figure.name}
                    </h4>
                    <p className="text-sm text-valley-green font-medium mb-2">
                      {figure.role}
                    </p>
                    <p className="text-sm text-text-secondary mb-3">
                      {figure.description}
                    </p>
                    <div className="text-xs text-text-secondary">
                      <span className="font-medium">Notable for:</span> {figure.achievements[0]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8 text-center">
            Areas of Contribution
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-background-primary p-6 rounded-lg shadow-sm text-center">
              <MusicalNoteIcon className="h-10 w-10 text-ocean-blue mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Music & Poetry</h4>
              <p className="text-sm text-text-secondary">
                Composers, poets, and musicians who shaped Cape Verdean artistic expression.
              </p>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm text-center">
              <BookOpenIcon className="h-10 w-10 text-valley-green mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Literature</h4>
              <p className="text-sm text-text-secondary">
                Writers and storytellers who preserved and created Cape Verdean literature.
              </p>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm text-center">
              <AcademicCapIcon className="h-10 w-10 text-bougainvillea-pink mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Education & Leadership</h4>
              <p className="text-sm text-text-secondary">
                Educators and leaders who guided community development and cultural preservation.
              </p>
            </div>
            
            <div className="bg-background-primary p-6 rounded-lg shadow-sm text-center">
              <PencilIcon className="h-10 w-10 text-sunny-yellow mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">Arts & Crafts</h4>
              <p className="text-sm text-text-secondary">
                Traditional craftsmen and artists who maintained cultural practices.
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