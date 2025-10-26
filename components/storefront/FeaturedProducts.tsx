"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
          Featured Products
        </h2>
        <p className="text-gray-400 text-lg">
          Handpicked selections just for you
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                    {product.image_url ? (
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <ShoppingCart size={48} className="text-white/30" />
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
              </motion.div>
            ))}
      </div>

      {products && products.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 inline-block">
            <ShoppingCart size={64} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">
              No featured products available yet
            </h3>
            <p className="text-gray-400 mb-6">
              Check back soon for our handpicked selections
            </p>
            <Link href="/products">
              <button
                type="button"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Browse All Products
              </button>
            </Link>
          </div>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="text-center mt-12">
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="px-8 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 hover:border-white/30 transition-all"
            >
              View All Products
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
}
