import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import ProductCard from "@/components/storefront/ProductCard";

interface ProductsPageProps {
  searchParams: { category?: string; subcategory?: string };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const supabase = await createClient();
  const { category, subcategory } = await searchParams;

  let query = supabase.from("products").select("*").eq("is_active", true);

  // Filter by category if provided
  if (category) {
    query = query.eq("category", category);
  }

  // Filter by subcategory if provided
  if (subcategory) {
    query = query.eq("subcategory", subcategory);
  }

  const { data: products } = await query.order("created_at", {
    ascending: false,
  });

  // Generate page title based on filters
  let pageTitle = "All Products";
  let pageDescription = "Discover our complete collection";

  if (subcategory) {
    pageTitle = subcategory;
    pageDescription = `Browse our ${subcategory.toLowerCase()} collection`;
  } else if (category) {
    pageTitle = category;
    pageDescription = `Explore ${category.toLowerCase()} products`;
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          {/* Breadcrumbs */}
          {(category || subcategory) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <a
                href="/"
                className="hover:text-pink-600 transition-colors"
              >
                Home
              </a>
              <span>/</span>
              {category &&
                (subcategory ? (
                  <a
                    href={`/products?category=${encodeURIComponent(category)}`}
                      className="hover:text-pink-600 transition-colors"
                    >
                    {category}
                  </a>
                ) : (
                    <span className="text-gray-900 font-medium">
                      {category}
                    </span>
                ))}
              {subcategory && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">
                    {subcategory}
                  </span>
                </>
              )}
            </div>
          )}

          <h1 className="font-serif text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            {pageTitle}
          </h1>
          <p className="text-gray-600 text-lg">
            {pageDescription}
          </p>

          {/* Results count */}
          {products && products.length > 0 && (
            <p className="text-gray-500 text-sm mt-2">
              {products.length} {products.length === 1 ? "product" : "products"}{" "}
              found
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {(!products || products.length === 0) && (
          <div className="text-center py-12">
            <div className="glass-card rounded-2xl p-12 inline-block">
              <p className="text-gray-600 text-lg mb-2">
                No products available in this category yet.
              </p>
              <a
                href="/products"
                className="text-pink-600 hover:text-pink-700 underline transition-colors"
              >
                View all products
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
