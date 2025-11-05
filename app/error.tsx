"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-lg w-full backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-8 text-center shadow-xl">
        <div className="mb-6">
          <AlertCircle className="mx-auto text-red-500" size={64} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h1>

        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
