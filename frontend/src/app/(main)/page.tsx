import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-800">
      <div className="text-center p-8">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-blue-900">
          Nosilha.com
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-lg md:text-xl text-gray-600">
          Your Digital Guide to Brava Island, Cape Verde
        </p>

        {/* Placeholder Links */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/towns/nova-sintra"
            className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition-colors"
          >
            Explore Nova Sintra
          </Link>
          <Link
            href="/directory/restaurants"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
          >
            Find Restaurants
          </Link>
          <Link
            href="/history"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
          >
            Discover History
          </Link>
        </div>
      </div>
    </main>
  );
}
