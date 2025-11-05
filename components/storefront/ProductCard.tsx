"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import AddToCompareButton from "./AddToCompareButton";
import { formatINR } from "@/lib/utils/currency";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  on_sale?: boolean;
  sale_ends_at?: string;
  image_url: string | null;
  slug: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (slug: string) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group cozy-card overflow-hidden will-change-transform"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          {/* Wishlist button */}
          <div className="absolute top-3 left-3 z-10">
            <WishlistButton productId={product.id} />
          </div>

          {/* Compare button */}
          <div className="absolute top-3 left-16 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <AddToCompareButton productId={product.id} />
          </div>

          {/* Sale badge */}
          {product.on_sale && product.discount_percentage && (
            <div className="absolute top-3 right-3 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              -{product.discount_percentage}% OFF
            </div>
          )}

          {/* Quick View button */}
          {onQuickView && (
            <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product.slug);
                }}
                className="p-2.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                title="Quick View"
              >
                <Eye size={18} />
              </button>
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 smooth-transition duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <ShoppingCart size={48} className="text-gray-400" />
            </div>
          )}
          {/* Image overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </Link>

      <div className="p-6 space-y-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-xl md:text-2xl text-gray-900 tracking-tight group-hover:text-pink-600 smooth-transition line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            {product.original_price &&
            product.original_price > product.price ? (
              <>
                <span className="font-serif text-2xl md:text-3xl text-pink-600 tracking-tight font-bold">
                  {formatINR(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 line-through">
                    {formatINR(product.original_price)}
                  </span>
                  {product.discount_percentage && (
                    <span className="text-xs font-bold text-green-600">
                      Save {product.discount_percentage}%
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="font-serif text-2xl md:text-3xl text-pink-600 tracking-tight font-bold">
                {formatINR(product.price)}
              </span>
            )}
          </div>
          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-amber-700 font-medium mt-2">
            Only {product.stock} left!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-600 font-medium mt-2">Out of stock</p>
        )}
      </div>
    </motion.div>
  );
}
