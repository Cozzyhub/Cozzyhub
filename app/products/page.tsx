import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import ProductCard from "@/components/storefront/ProductCard";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">All Products</h1>
          <p className="text-gray-400 text-lg">
            Discover our complete collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {(!products || products.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
