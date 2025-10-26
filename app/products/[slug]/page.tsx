import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/storefront/Navbar";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils/currency";
import ProductAddSection from "@/components/storefront/ProductAddSection";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="w-full aspect-[4/3] bg-white/5">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />)
              : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  No image
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>
            <p className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              {formatINR(Number(product.price))}
            </p>

            {product.description && (
              <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">
                  In stock: {product.stock}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">
                  Out of stock
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <ProductAddSection productId={product.id} stock={product.stock} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
