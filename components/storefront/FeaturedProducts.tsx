"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatINR } from "@/lib/utils/currency";
import AddToCartButton from "@/components/storefront/AddToCartButton";

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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          Featured Products
        </h2>
        <p className="text-gray-400 text-lg">
          Handpicked selections just for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Link href={`/products/${product.slug}`}>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-105">
                {product.image_url ? (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <ShoppingCart size={48} className="text-white/30" />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No featured products available yet.
          </p>
          <Link href="/products">
            <button
              type="button"
              className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              Browse All Products
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
