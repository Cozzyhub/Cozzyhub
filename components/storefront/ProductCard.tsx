"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { formatINR } from "@/lib/utils/currency";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-3xl">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <ShoppingCart
                size={48}
                className="text-gray-400"
              />
            </div>
          )}
          {/* Image overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </Link>

      <div className="p-6 space-y-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-xl md:text-2xl text-gray-900 tracking-tight group-hover:text-pink-600 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-2">
          <span className="font-serif text-2xl md:text-3xl text-pink-600 tracking-tight font-bold transition-colors duration-300">
            {formatINR(product.price)}
          </span>
          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-amber-700 font-medium mt-2 transition-colors duration-300">
            Only {product.stock} left!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-600 font-medium mt-2 transition-colors duration-300">Out of stock</p>
        )}
      </div>
    </motion.div>
  );
}
