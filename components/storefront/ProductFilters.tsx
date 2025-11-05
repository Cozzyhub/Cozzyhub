"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, ChevronDown, ChevronUp, Star } from "lucide-react";

interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductFilters({ isOpen, onClose }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [onSale, setOnSale] = useState(searchParams.get("onSale") === "true");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Add or remove price filters
    if (priceMin) {
      params.set("priceMin", priceMin);
    } else {
      params.delete("priceMin");
    }
    
    if (priceMax) {
      params.set("priceMax", priceMax);
    } else {
      params.delete("priceMax");
    }
    
    // Add or remove rating filter
    if (minRating) {
      params.set("rating", minRating);
    } else {
      params.delete("rating");
    }
    
    // Add or remove availability filters
    if (inStock) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }
    
    if (onSale) {
      params.set("onSale", "true");
    } else {
      params.delete("onSale");
    }
    
    if (featured) {
      params.set("featured", "true");
    } else {
      params.delete("featured");
    }
    
    // Reset to page 1 when filters change
    params.set("page", "1");
    
    router.push(`/products?${params.toString()}`);
    onClose();
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove all filter params
    params.delete("priceMin");
    params.delete("priceMax");
    params.delete("rating");
    params.delete("inStock");
    params.delete("onSale");
    params.delete("featured");
    params.set("page", "1");
    
    // Reset state
    setPriceMin("");
    setPriceMax("");
    setMinRating("");
    setInStock(false);
    setOnSale(false);
    setFeatured(false);
    
    router.push(`/products?${params.toString()}`);
  };

  const hasActiveFilters = priceMin || priceMax || minRating || inStock || onSale || featured;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-white border-r lg:border border-gray-200 rounded-none lg:rounded-xl shadow-2xl lg:shadow-md overflow-y-auto z-50 lg:z-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-pink-600" />
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection("price")}
                  className="flex items-center justify-between w-full mb-3 hover:text-pink-600 transition-colors"
                >
                  <h3 className="font-bold text-base text-gray-900">Price Range</h3>
                  {expandedSections.price ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </button>
                
                {expandedSections.price && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Price</label>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="₹0"
                        min="0"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Price</label>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="₹10000"
                        min="0"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => toggleSection("rating")}
                  className="flex items-center justify-between w-full mb-3 hover:text-pink-600 transition-colors"
                >
                  <h3 className="font-bold text-base text-gray-900">Minimum Rating</h3>
                  {expandedSections.rating ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </button>
                
                {expandedSections.rating && (
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating.toString())}
                        className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg transition-all ${
                          minRating === rating.toString()
                            ? "bg-pink-100 border-2 border-pink-500 shadow-sm"
                            : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={15}
                              className={
                                i < rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">& up</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => toggleSection("availability")}
                  className="flex items-center justify-between w-full mb-3 hover:text-pink-600 transition-colors"
                >
                  <h3 className="font-bold text-base text-gray-900">Availability</h3>
                  {expandedSections.availability ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </button>
                
                {expandedSections.availability && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">In Stock Only</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={onSale}
                        onChange={(e) => setOnSale(e.target.checked)}
                        className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">On Sale</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">Featured Products</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 p-5 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-200 space-y-2.5">
              <button
                onClick={applyFilters}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transform hover:scale-[1.02] transition-all"
              >
                Apply Filters
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 border border-gray-300 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
