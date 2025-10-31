"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { formatINR } from "@/lib/utils/currency";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import ProductCardSkeleton from "@/components/storefront/ProductCardSkeleton";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  stock: number;
}

export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  const isLoading = !products;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white transition-colors duration-300">
      <div className="text-center mb-16">
        <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4 tracking-tight transition-colors duration-300">
          Featured Products
        </h2>
        <p className="text-gray-600 text-lg transition-colors duration-300">
          Handpicked selections just for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products.map((product, index) => (
              <div
                key={product.id}
                className="group hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-300"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    {product.image_url ? (
                      <div className="relative aspect-square overflow-hidden rounded-t-3xl">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading={index < 4 ? "eager" : "lazy"}
                          priority={index < 4}
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center rounded-t-3xl transition-colors duration-300">
                        <ShoppingCart size={48} className="text-gray-400" />
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <h3 className="font-serif text-xl text-gray-900 tracking-tight line-clamp-2 group-hover:text-pink-600 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-serif text-2xl text-pink-600 tracking-tight font-bold transition-colors duration-300">
                          {formatINR(product.price)}
                        </span>
                        <div onClick={(e) => e.preventDefault()}>
                          <AddToCartButton
                            productId={product.id}
                            stock={product.stock}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
      </div>

      {products && products.length === 0 && (
        <div className="text-center py-16">
          <div className="glass-card rounded-3xl p-12 inline-block">
            <ShoppingCart size={64} className="text-gray-600 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-gray-900 text-xl font-semibold mb-2 transition-colors duration-300">
              No featured products available yet
            </h3>
            <p className="text-gray-600 mb-6 transition-colors duration-300">
              Check back soon for our handpicked selections
            </p>
            <Link href="/products">
              <button
                type="button"
                className="px-8 py-4 btn-primary rounded-2xl"
              >
                Browse All Products
              </button>
            </Link>
          </div>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="text-center mt-16">
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="px-8 py-4 btn-ghost rounded-2xl"
            >
              View All Products
            </motion.button>
          </Link>
        </div>
      )}
    </section>
  );
}
