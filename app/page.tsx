import Navbar from "@/components/storefront/Navbar";
import Hero from "@/components/storefront/Hero";
import Categories from "@/components/storefront/Categories";
import FeaturedProductsWrapper from "@/components/storefront/FeaturedProductsWrapper";
import Footer from "@/components/storefront/Footer";
import { Suspense } from "react";

export const metadata = {
  title: "CosyHub - Your Cozy Corner for Comfort & Style",
  description:
    "Discover handpicked products for your home. Shop ethnic wear, fashion, electronics, and more at CosyHub.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Categories />
      <Hero />
      <Suspense
        fallback={
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="h-96 flex items-center justify-center text-gray-600">
              Loading products...
            </div>
          </section>
        }
      >
        <FeaturedProductsWrapper />
      </Suspense>
      <Footer />
    </div>
  );
}
