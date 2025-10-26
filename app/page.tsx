import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import Hero from "@/components/storefront/Hero";
import FeaturedProducts from "@/components/storefront/FeaturedProducts";
import Categories from "@/components/storefront/Categories";
import Footer from "@/components/storefront/Footer";

export default async function Home() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProducts products={products || []} />
      <Footer />
    </div>
  );
}
