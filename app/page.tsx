import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import Hero from "@/components/storefront/Hero";
import FeaturedProducts from "@/components/storefront/FeaturedProducts";
import Categories from "@/components/storefront/Categories";
import Footer from "@/components/storefront/Footer";

export const metadata = {
  title: "CosyHub - Your Cozy Corner for Comfort & Style",
  description: "Discover handpicked products for your home. Shop ethnic wear, fashion, electronics, and more at CosyHub.",
};

export default async function Home() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col">
      <Navbar />
      <Categories />
      <Hero />
      <FeaturedProducts products={products || []} />
      <Footer />
    </div>
  );
}
