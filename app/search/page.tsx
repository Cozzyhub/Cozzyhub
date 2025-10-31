import Navbar from "@/components/storefront/Navbar";
import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Navbar />
      <Suspense
        fallback={
          <div className="section-container py-12 text-center text-gray-600">
            Loading search…
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  );
}
