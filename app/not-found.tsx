import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-lg w-full backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-8 text-center shadow-xl">
        <div className="mb-6">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            <Home size={20} />
            Go Home
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            <Search size={20} />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
