import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { 
  CameraIcon, 
  PhotoIcon, 
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon
} from "@heroicons/react/24/outline";

// Enable ISR with 1 hour revalidation for photo content
export const revalidate = 3600;

// Photo galleries data (in a real implementation, this would come from the API)
const photoGalleries = [
  {
    id: "landscapes",
    title: "Dramatic Landscapes",
    description: "Breathtaking views of Brava's unique volcanic terrain",
    category: "Nature",
    imageCount: 24,
    coverImage: "/images/galleries/landscapes-cover.jpg",
    featured: true,
    photos: [
      "/images/galleries/landscapes/landscape-1.jpg",
      "/images/galleries/landscapes/landscape-2.jpg",
      "/images/galleries/landscapes/landscape-3.jpg",
      "/images/galleries/landscapes/landscape-4.jpg",
      "/images/galleries/landscapes/landscape-5.jpg",
      "/images/galleries/landscapes/landscape-6.jpg"
    ]
  },
  {
    id: "coastal",
    title: "Coastal Beauty",
    description: "Stunning coastlines and pristine beaches",
    category: "Nature",
    imageCount: 18,
    coverImage: "/images/galleries/coastal-cover.jpg",
    featured: true,
    photos: [
      "/images/galleries/coastal/coastal-1.jpg",
      "/images/galleries/coastal/coastal-2.jpg",
      "/images/galleries/coastal/coastal-3.jpg",
      "/images/galleries/coastal/coastal-4.jpg",
      "/images/galleries/coastal/coastal-5.jpg",
      "/images/galleries/coastal/coastal-6.jpg"
    ]
  },
  {
    id: "cultural",
    title: "Cultural Events",
    description: "Traditional festivals and community celebrations",
    category: "Culture",
    imageCount: 32,
    coverImage: "/images/galleries/cultural-cover.jpg",
    featured: true,
    photos: [
      "/images/galleries/cultural/cultural-1.jpg",
      "/images/galleries/cultural/cultural-2.jpg",
      "/images/galleries/cultural/cultural-3.jpg",
      "/images/galleries/cultural/cultural-4.jpg",
      "/images/galleries/cultural/cultural-5.jpg",
      "/images/galleries/cultural/cultural-6.jpg"
    ]
  },
  {
    id: "architecture",
    title: "Architecture & Heritage",
    description: "Traditional buildings and historical sites",
    category: "Architecture",
    imageCount: 15,
    coverImage: "/images/galleries/architecture-cover.jpg",
    featured: false,
    photos: [
      "/images/galleries/architecture/arch-1.jpg",
      "/images/galleries/architecture/arch-2.jpg",
      "/images/galleries/architecture/arch-3.jpg",
      "/images/galleries/architecture/arch-4.jpg"
    ]
  },
  {
    id: "daily-life",
    title: "Daily Life",
    description: "Everyday moments and local community life",
    category: "Community",
    imageCount: 28,
    coverImage: "/images/galleries/daily-life-cover.jpg",
    featured: false,
    photos: [
      "/images/galleries/daily-life/daily-1.jpg",
      "/images/galleries/daily-life/daily-2.jpg",
      "/images/galleries/daily-life/daily-3.jpg",
      "/images/galleries/daily-life/daily-4.jpg"
    ]
  },
  {
    id: "flora-fauna",
    title: "Flora & Fauna",
    description: "The unique plant and animal life of Brava",
    category: "Nature",
    imageCount: 21,
    coverImage: "/images/galleries/flora-fauna-cover.jpg",
    featured: false,
    photos: [
      "/images/galleries/flora-fauna/flora-1.jpg",
      "/images/galleries/flora-fauna/flora-2.jpg",
      "/images/galleries/flora-fauna/flora-3.jpg",
      "/images/galleries/flora-fauna/flora-4.jpg"
    ]
  }
];

const categories = [
  { name: "All", value: "all", count: photoGalleries.reduce((sum, gallery) => sum + gallery.imageCount, 0) },
  { name: "Nature", value: "nature", count: photoGalleries.filter(g => g.category === "Nature").reduce((sum, gallery) => sum + gallery.imageCount, 0) },
  { name: "Culture", value: "culture", count: photoGalleries.filter(g => g.category === "Culture").reduce((sum, gallery) => sum + gallery.imageCount, 0) },
  { name: "Architecture", value: "architecture", count: photoGalleries.filter(g => g.category === "Architecture").reduce((sum, gallery) => sum + gallery.imageCount, 0) },
  { name: "Community", value: "community", count: photoGalleries.filter(g => g.category === "Community").reduce((sum, gallery) => sum + gallery.imageCount, 0) }
];

export default function PhotosPage() {
  const featuredGalleries = photoGalleries.filter(gallery => gallery.featured);
  const otherGalleries = photoGalleries.filter(gallery => !gallery.featured);

  return (
    <div className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Photo Galleries"
          subtitle="Discover the visual story of Brava Island through curated collections of photographs showcasing its natural beauty, cultural heritage, and daily life."
        />

        {/* Introduction Section */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-volcanic-gray-dark mb-4">
                A Visual Journey Through Brava
              </h2>
              <p className="text-lg text-volcanic-gray mb-4">
                These photo galleries capture the essence of Brava Island—from its dramatic 
                volcanic landscapes to its vibrant cultural traditions. Each image tells a 
                story of this remarkable island and its resilient people.
              </p>
              <p className="text-volcanic-gray">
                All photographs are contributed by community members, visitors, and 
                local photographers who want to share the beauty of Brava with the world.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/galleries/brava-photo-overview.jpg"
                alt="Photographer capturing the beauty of Brava Island"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Photo Statistics */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-8 text-center">
            Gallery Categories
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <div key={category.value} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-ocean-blue mb-1">{category.count}</div>
                <div className="text-sm text-volcanic-gray-dark font-medium">{category.name}</div>
                <div className="text-xs text-volcanic-gray">photographs</div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Galleries */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-8">
            Featured Galleries
          </h3>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {featuredGalleries.map((gallery) => (
              <div key={gallery.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={gallery.coverImage}
                    alt={`${gallery.title} gallery cover`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-volcanic-gray-dark px-2 py-1 rounded text-xs font-medium">
                      {gallery.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                      <PhotoIcon className="h-3 w-3 mr-1" />
                      {gallery.imageCount}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-serif text-xl font-bold text-volcanic-gray-dark mb-2">
                    {gallery.title}
                  </h4>
                  <p className="text-volcanic-gray mb-4">
                    {gallery.description}
                  </p>
                  
                  {/* Photo Preview Grid */}
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {gallery.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={photo}
                          alt={`${gallery.title} preview ${index + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full bg-ocean-blue text-white py-2 px-4 rounded font-medium hover:bg-ocean-blue/90 transition-colors">
                    View Gallery
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Galleries */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-8">
            More Galleries
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherGalleries.map((gallery) => (
              <div key={gallery.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={gallery.coverImage}
                      alt={`${gallery.title} gallery cover`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-xs bg-valley-green/10 text-valley-green px-2 py-1 rounded">
                        {gallery.category}
                      </span>
                      <span className="text-xs text-volcanic-gray ml-2 flex items-center">
                        <PhotoIcon className="h-3 w-3 mr-1" />
                        {gallery.imageCount}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-1">
                      {gallery.title}
                    </h4>
                    <p className="text-sm text-volcanic-gray mb-3">
                      {gallery.description}
                    </p>
                    <button className="text-sm text-ocean-blue hover:text-ocean-blue/80 font-medium">
                      View Gallery →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contribution Guidelines */}
        <section className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6 text-center">
            Share Your Photos
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-3">
                Photo Submission Guidelines
              </h4>
              <ul className="space-y-2 text-volcanic-gray">
                <li className="flex items-start">
                  <CameraIcon className="h-4 w-4 text-ocean-blue mr-2 mt-0.5 flex-shrink-0" />
                  High-resolution images (minimum 1200px width)
                </li>
                <li className="flex items-start">
                  <MapPinIcon className="h-4 w-4 text-ocean-blue mr-2 mt-0.5 flex-shrink-0" />
                  Include location information when possible
                </li>
                <li className="flex items-start">
                  <CalendarIcon className="h-4 w-4 text-ocean-blue mr-2 mt-0.5 flex-shrink-0" />
                  Add date and context for cultural events
                </li>
                <li className="flex items-start">
                  <EyeIcon className="h-4 w-4 text-ocean-blue mr-2 mt-0.5 flex-shrink-0" />
                  Respect privacy and property rights
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-3">
                What We're Looking For
              </h4>
              <ul className="space-y-2 text-volcanic-gray">
                <li>• Scenic landscapes and natural beauty</li>
                <li>• Cultural events and traditional celebrations</li>
                <li>• Daily life and community moments</li>
                <li>• Historical sites and architecture</li>
                <li>• Local flora and fauna</li>
                <li>• Street scenes and local businesses</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link
              href="/contribute"
              className="rounded-md bg-ocean-blue px-8 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Contribute Your Photos
            </Link>
          </div>
        </section>

        {/* Community Highlights */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-6 text-center">
            Community Contributions
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <HeartIcon className="h-12 w-12 text-ocean-blue mx-auto mb-3" />
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                Local Photographers
              </h4>
              <p className="text-volcanic-gray">
                Many of our galleries feature work by talented local photographers 
                who capture the authentic spirit of Brava Island.
              </p>
            </div>
            
            <div className="text-center">
              <CameraIcon className="h-12 w-12 text-valley-green mx-auto mb-3" />
              <h4 className="font-semibold text-lg text-volcanic-gray-dark mb-2">
                Visitor Contributions
              </h4>
              <p className="text-volcanic-gray">
                Visitors to Brava Island share their unique perspectives, 
                helping us showcase the island through different eyes.
              </p>
            </div>
          </div>
        </section>

        {/* Explore More */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-volcanic-gray-dark mb-4">
            Explore More of Brava
          </h3>
          <p className="text-lg text-volcanic-gray mb-6">
            Discover other aspects of Brava Island's rich culture and heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/media/music"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Music & Arts
            </Link>
            <Link
              href="/history"
              className="rounded-md border-2 border-valley-green px-6 py-3 text-base font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              Island History
            </Link>
            <Link
              href="/map"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
            >
              Interactive Map
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
    title: 'Photo Galleries of Brava Island | Nos Ilha',
    description: 'Discover the visual story of Brava Island through curated collections of photographs showcasing its natural beauty, cultural heritage, and daily life.',
    openGraph: {
      title: 'Photo Galleries - Brava Island',
      description: 'Explore stunning photographs of Brava Island including landscapes, cultural events, architecture, and community life.',
      images: ['/images/galleries/brava-photo-overview.jpg'],
    },
  };
}