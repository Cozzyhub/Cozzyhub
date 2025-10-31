import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils/currency";
import ProductAddSection from "@/components/storefront/ProductAddSection";
import ProductCard from "@/components/storefront/ProductCard";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) return notFound();

  // Fetch similar products (same category or just random products)
  const { data: similarProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  // Try to get products from same category if category exists
  let suggestions = similarProducts || [];
  if (product.category && similarProducts) {
    const { data: categoryProducts } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(4);
    if (categoryProducts && categoryProducts.length > 0) {
      suggestions = categoryProducts;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
            <div className="w-full aspect-square bg-gray-50">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              {product.category && (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                  {product.category}
                </span>
              )}
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-serif font-bold text-pink-600">
                {formatINR(Number(product.price))}
              </p>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mb-8">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium text-green-700">
                    In stock: {product.stock} available
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm font-medium text-red-700">
                    Out of stock
                  </span>
                </div>
              )}
            </div>

            {product.stock > 0 && (
              <ProductAddSection productId={product.id} stock={product.stock} />
            )}

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free delivery on all orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Cash on Delivery available</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>100% secure shopping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-20 border-t border-gray-200 pt-16">
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                You May Also Like
              </h2>
              <p className="text-gray-600">Similar products you might be interested in</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map((suggestedProduct) => (
                <ProductCard key={suggestedProduct.id} product={suggestedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
