"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const popularSearches = [
    "Silk Sarees",
    "T-Shirts",
    "Kurta Sets",
    "Headphones",
    "Watches",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, image_url, category")
          .eq("is_active", true)
          .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, supabase]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setQuery("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for products, categories..."
          className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (query || suggestions.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                <div className="p-2 border-b border-white/10">
                  <p className="text-xs text-gray-400 px-2">Products</p>
                </div>
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition cursor-pointer"
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs">{product.category}</p>
                    </div>
                    <p className="text-purple-400 font-semibold text-sm">
                      ₹{product.price}
                    </p>
                  </Link>
                ))}
                {query && (
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full p-3 text-left text-sm text-purple-400 hover:bg-white/5 transition border-t border-white/10 flex items-center gap-2"
                  >
                    <Search size={16} />
                    Search for "{query}"
                  </button>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No products found
              </div>
            ) : (
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-3 px-2">
                  Popular Searches
                </p>
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition rounded-lg flex items-center gap-2"
                  >
                    <TrendingUp size={14} className="text-purple-400" />
                    {search}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
