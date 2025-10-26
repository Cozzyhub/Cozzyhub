"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/storefront/Navbar";
import ProductCard from "@/components/storefront/ProductCard";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryNames } from "@/lib/categories";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [inStock, setInStock] = useState(false);

  const categories = getCategoryNames();

  const searchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      // Search by name or description
      if (query) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      // Category filter
      if (selectedCategory) {
        queryBuilder = queryBuilder.eq("category", selectedCategory);
      }

      // Price filters
      if (minPrice) {
        queryBuilder = queryBuilder.gte("price", parseFloat(minPrice));
      }
      if (maxPrice) {
        queryBuilder = queryBuilder.lte("price", parseFloat(maxPrice));
      }

      // Stock filter
      if (inStock) {
        queryBuilder = queryBuilder.gt("stock", 0);
      }

      // Sorting
      switch (sortBy) {
        case "price_low":
          queryBuilder = queryBuilder.order("price", { ascending: true });
          break;
        case "price_high":
          queryBuilder = queryBuilder.order("price", { ascending: false });
          break;
        case "newest":
          queryBuilder = queryBuilder.order("created_at", { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order("created_at", { ascending: false });
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, minPrice, maxPrice, sortBy, inStock, supabase]);

  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    searchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
    setInStock(false);
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStock ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchProducts();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={false}
            animate={{ width: showFilters ? 280 : 0 }}
            className="overflow-hidden"
          >
            <div className="w-70 space-y-6">
              {/* Category Filter */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  Category
                </h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  Price Range
                </h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  Availability
                </h3>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition text-sm"
                >
                  Clear Filters ({activeFiltersCount})
                </button>
              )}
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-lg transition"
                >
                  <SlidersHorizontal size={18} />
                  <span className="text-sm font-medium">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <p className="text-gray-400 text-sm">
                  {loading ? "Searching..." : `${products.length} products found`}
                </p>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/10 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="newest">Sort by: Newest</option>
                <option value="price_low">Sort by: Price Low to High</option>
                <option value="price_high">Sort by: Price High to Low</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 inline-block">
                  <Search size={48} className="text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search or filters
                  </p>
                  {(query || activeFiltersCount > 0) && (
                    <button
                      onClick={() => {
                        setQuery("");
                        clearFilters();
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
