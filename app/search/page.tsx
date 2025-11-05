import Navbar from "@/components/storefront/Navbar";
import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-12 bg-white/50 rounded-lg animate-pulse" />
              <ProductGridSkeleton count={8} />
            </div>
          }
        >
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
