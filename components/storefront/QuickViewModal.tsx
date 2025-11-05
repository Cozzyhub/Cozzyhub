"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, ShoppingCart, ExternalLink, Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/utils/currency";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import ImageZoom from "@/components/ui/ImageZoom";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSlug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  image_url: string;
  images: string[] | null;
  stock: number;
  category: string | null;
  subcategory: string | null;
  average_rating: number | null;
  review_count: number | null;
  on_sale: boolean;
  sale_ends_at: string | null;
}

export default function QuickViewModal({
  isOpen,
  onClose,
  productSlug,
}: QuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && productSlug) {
      fetchProduct();
    }
  }, [isOpen, productSlug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productSlug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setCurrentImageIndex(0);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const images = product?.images || (product?.image_url ? [product.image_url] : []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700">
                  <Eye size={20} />
                  <span className="font-semibold">Quick View</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : product ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        {product.on_sale && product.discount_percentage && (
                          <div className="absolute top-3 right-3 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            -{product.discount_percentage}% OFF
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        <ImageZoom
                          src={images[currentImageIndex]}
                          alt={product.name}
                          zoomScale={2}
                        />
                      </div>

                      {/* Thumbnail Strip */}
                      {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                                idx === currentImageIndex
                                  ? "border-pink-500"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`${product.name} ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                      {/* Category */}
                      {product.category && (
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          {product.category}
                        </span>
                      )}

                      {/* Title */}
                      <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                          {product.name}
                        </h2>

                        {/* Rating */}
                        {product.average_rating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={
                                    i < Math.round(product.average_rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {product.average_rating.toFixed(1)} (
                              {product.review_count || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div>
                        {product.original_price &&
                        product.original_price > product.price ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <p className="text-3xl font-serif font-bold text-pink-600">
                                {formatINR(product.price)}
                              </p>
                              <span className="text-xl text-gray-400 line-through">
                                {formatINR(product.original_price)}
                              </span>
                            </div>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                              Save {formatINR(product.original_price - product.price)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-3xl font-serif font-bold text-pink-600">
                            {formatINR(product.price)}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      {product.description && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Description
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-4">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* Stock Status */}
                      <div>
                        {product.stock > 0 && product.stock < 10 && (
                          <p className="text-sm text-amber-700 font-medium">
                            Only {product.stock} left in stock!
                          </p>
                        )}
                        {product.stock === 0 && (
                          <p className="text-sm text-red-600 font-semibold">
                            Out of stock
                          </p>
                        )}
                        {product.stock >= 10 && (
                          <p className="text-sm text-green-600 font-medium">
                            In stock
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <AddToCartButton
                              productId={product.id}
                              stock={product.stock}
                            />
                          </div>
                          <WishlistButton productId={product.id} />
                        </div>

                        <Link
                          href={`/products/${product.slug}`}
                          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                        >
                          <ExternalLink size={18} />
                          View Full Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    Product not found
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
