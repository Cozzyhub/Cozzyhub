import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { formatINR } from "@/lib/utils/currency";
import ProductAddSection from "@/components/storefront/ProductAddSection";
import ProductCard from "@/components/storefront/ProductCard";
import ProductImageGallery from "@/components/storefront/ProductImageGallery";
import RelatedProducts from "@/components/storefront/RelatedProducts";
import ProductReviews from "@/components/storefront/ProductReviews";
import WishlistButton from "@/components/storefront/WishlistButton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShareButtons from "@/components/ui/ShareButtons";
import ProductViewTracker from "@/components/storefront/ProductViewTracker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} at CozzyHub. ${product.category || "Shop now"}.`;

  return {
    title: `${product.name} | CozzyHub`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [product.image_url],
      type: "website",
      url: `https://cozyhub.com/products/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [product.image_url],
    },
  };
}

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

  // Fetch related products with smart logic
  let relatedProducts = [];

  // First, try to get products from same category
  if (product.category) {
    const { data: categoryProducts } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category", product.category)
      .neq("id", product.id)
      .order("average_rating", { ascending: false, nullsFirst: false })
      .limit(8);
    
    if (categoryProducts && categoryProducts.length > 0) {
      relatedProducts = categoryProducts;
    }
  }

  // If not enough products from same category, add random products
  if (relatedProducts.length < 4) {
    const { data: randomProducts } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(8 - relatedProducts.length);
    
    if (randomProducts) {
      relatedProducts = [...relatedProducts, ...randomProducts];
    }
  }

  // Limit to 8 products total
  relatedProducts = relatedProducts.slice(0, 8);

  return (
    <div className="min-h-screen warm-gradient-bg">
      <ProductViewTracker productId={product.id} />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs
          items={[
            { label: "Products", href: "/products" },
            ...(product.category
              ? [
                  {
                    label: product.category,
                    href: `/products?category=${product.category}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <ProductImageGallery
            images={product.images || [product.image_url]}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {product.category && (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                    {product.category}
                  </span>
                )}
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
              </div>
              <WishlistButton productId={product.id} />
            </div>

            <div className="mb-6">
              {product.original_price &&
              product.original_price > product.price ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <p className="text-4xl font-serif font-bold text-pink-600">
                      {formatINR(Number(product.price))}
                    </p>
                    <span className="text-2xl text-gray-400 line-through">
                      {formatINR(Number(product.original_price))}
                    </span>
                  </div>
                  {product.discount_percentage && (
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                        {product.discount_percentage}% OFF
                      </span>
                      <span className="text-green-600 font-semibold">
                        You save{" "}
                        {formatINR(
                          Number(product.original_price) -
                            Number(product.price),
                        )}
                      </span>
                    </div>
                  )}
                  {product.sale_ends_at &&
                    new Date(product.sale_ends_at) > new Date() && (
                      <p className="text-sm text-amber-600 font-medium">
                        Sale ends on{" "}
                        {new Date(product.sale_ends_at).toLocaleDateString()}
                      </p>
                    )}
                </div>
              ) : (
                <p className="text-4xl font-serif font-bold text-pink-600">
                  {formatINR(Number(product.price))}
                </p>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
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

            {/* Share Buttons */}
            <div className="mt-6">
              <ShareButtons
                url={`https://cozyhub.com/products/${slug}`}
                title={product.name}
                description={product.description || undefined}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Free delivery on all orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Cash on Delivery available</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>100% secure shopping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          products={relatedProducts} 
          title={product.category ? `More in ${product.category}` : "You May Also Like"}
        />
      </div>

      {/* Product Reviews */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductReviews productId={product.id} />
      </div>

      <Footer />
    </div>
  );
}
