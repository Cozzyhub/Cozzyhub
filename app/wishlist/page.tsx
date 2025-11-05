"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, Share2, CheckSquare, Square } from "lucide-react";
import { useToast } from "@/lib/contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface WishlistItem {
  id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    image_url: string;
    stock: number;
    average_rating: number | null;
    is_active: boolean;
  };
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const toast = useToast();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();

      if (res.ok) {
        setWishlist(data.wishlist || []);
      } else {
        toast.error(data.error || "Failed to load wishlist");
      }
    } catch (error) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist?product_id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setWishlist((prev) =>
          prev.filter((item) => item.product.id !== productId),
        );
        toast.success("Removed from wishlist");
      } else {
        toast.error("Failed to remove from wishlist");
      }
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (res.ok) {
        toast.success("Added to cart");
        router.refresh();
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const moveToCart = async (productId: string) => {
    await addToCart(productId, 1);
    await removeFromWishlist(productId);
  };

  const toggleSelectItem = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === wishlist.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlist.map((item) => item.product.id)));
    }
  };

  const bulkRemove = async () => {
    for (const productId of selectedItems) {
      await removeFromWishlist(productId);
    }
    setSelectedItems(new Set());
  };

  const bulkMoveToCart = async () => {
    for (const productId of selectedItems) {
      await moveToCart(productId);
    }
    setSelectedItems(new Set());
  };

  const shareWishlist = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "My Wishlist",
        text: "Check out my wishlist!",
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-white/10 rounded-lg w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"
              >
                <div className="w-full h-48 bg-white/10 rounded-lg mb-4" />
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Heart size={64} className="text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Add products you love to your wishlist
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="text-pink-500" size={32} />
            <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
            <span className="text-gray-400">({wishlist.length} items)</span>
          </div>
          <button
            onClick={shareWishlist}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>

        {/* Bulk Actions Toolbar */}
        <AnimatePresence>
          {selectedItems.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-4 mb-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-white font-semibold">
                  {selectedItems.size} item(s) selected
                </span>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Clear
                </button>
                <div className="flex-1" />
                <button
                  onClick={bulkMoveToCart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition font-semibold"
                >
                  <ShoppingCart size={16} />
                  Move to Cart
                </button>
                <button
                  onClick={bulkRemove}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition font-semibold"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button onClick={toggleSelectAll} className="hover:opacity-70">
              {selectedItems.size === wishlist.length ? (
                <CheckSquare className="text-pink-500" size={20} />
              ) : (
                <Square className="text-gray-400" size={20} />
              )}
            </button>
            <span className="text-gray-400 text-sm">Select All</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`backdrop-blur-xl bg-white/5 border rounded-2xl overflow-hidden hover:border-pink-500/50 transition group ${
                selectedItems.has(item.product.id)
                  ? "border-pink-500/50 bg-pink-500/5"
                  : "border-white/10"
              }`}
            >
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={() => toggleSelectItem(item.product.id)}
                  className="p-2 bg-black/50 backdrop-blur rounded-lg hover:bg-black/70 transition"
                >
                  {selectedItems.has(item.product.id) ? (
                    <CheckSquare className="text-pink-500" size={20} />
                  ) : (
                    <Square className="text-gray-400" size={20} />
                  )}
                </button>
              </div>
              <Link href={`/products/${item.product.slug}`}>
                <div className="relative aspect-square">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.product.discount_percentage && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                      -{item.product.discount_percentage}%
                    </div>
                  )}
                  {!item.product.is_active && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold">Unavailable</span>
                    </div>
                  )}
                  {item.product.stock === 0 && item.product.is_active && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold">Out of Stock</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="text-white font-semibold mb-2 hover:text-pink-400 transition line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                  {item.product.original_price ? (
                    <>
                      <span className="text-2xl font-bold text-pink-500">
                        ₹{item.product.price}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        ₹{item.product.original_price}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      ₹{item.product.price}
                    </span>
                  )}
                </div>

                {item.product.average_rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= item.product.average_rating!
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {item.product.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => moveToCart(item.product.id)}
                    disabled={!item.product.is_active || item.product.stock === 0}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={16} />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition font-semibold"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
