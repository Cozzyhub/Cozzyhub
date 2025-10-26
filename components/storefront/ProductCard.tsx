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
      whileHover={{ y: -4 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden group"
    >
      <Link href={`/products/${product.slug}`}>
        {product.image_url ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <ShoppingCart size={32} className="text-white/30" />
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {formatINR(product.price)}
          </span>
          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-yellow-400 mt-2">
            Only {product.stock} left!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-400 mt-2">Out of stock</p>
        )}
      </div>
    </motion.div>
  );
}
