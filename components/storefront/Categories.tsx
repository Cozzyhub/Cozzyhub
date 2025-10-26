"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { useScrollPosition } from "@/lib/hooks/useScrollPosition";

export default function Categories() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPosition = useScrollPosition();
  
  // Hide navbar when scrolled past hero (approx 400px)
  const shouldHideNavbar = scrollPosition > 400;

  const handleMouseEnter = (categoryName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredCategory(categoryName);
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setMegaMenuOpen(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hoveredCategoryData = categories.find(
    (cat) => cat.name === hoveredCategory
  );

  return (
    <motion.div
      className="sticky z-50 backdrop-blur-xl bg-gradient-to-r from-indigo-950/95 via-purple-900/95 to-pink-900/95 border-b border-white/20 shadow-2xl"
      style={{ top: shouldHideNavbar ? 0 : 64 }}
      animate={{ top: shouldHideNavbar ? 0 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Horizontal Category Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex md:flex-wrap items-center md:justify-center gap-2 py-3 overflow-x-auto md:overflow-visible scrollbar-hide">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isHovered = hoveredCategory === category.name;

            return (
              <motion.div
                key={category.name}
                onMouseEnter={() => handleMouseEnter(category.name)}
                onMouseLeave={handleMouseLeave}
                className="relative"
              >
                <motion.button
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 ${
                    isHovered
                      ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <motion.div
                    animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={18} />
                  </motion.div>
                  <span className="text-sm font-semibold">{category.name}</span>
                  <motion.div
                    animate={{ rotate: isHovered ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </motion.button>
                
                {/* Hover indicator line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {megaMenuOpen && hoveredCategoryData && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="absolute left-0 right-0 top-full bg-gradient-to-br from-slate-950/98 via-purple-950/98 to-slate-950/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {hoveredCategoryData.subcategories.map((subcategory, idx) => (
                  <motion.div
                    key={subcategory.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="space-y-3"
                  >
                    <h4 className="text-white font-bold text-sm uppercase tracking-wide border-b border-purple-500/30 pb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      {subcategory.title}
                    </h4>
                    <ul className="space-y-2">
                      {subcategory.items.map((item) => (
                        <motion.li
                          key={item}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            href={`/products?category=${encodeURIComponent(
                              hoveredCategoryData.name
                            )}&subcategory=${encodeURIComponent(item)}`}
                            className="text-gray-300 hover:text-white text-sm transition-all duration-200 inline-flex items-center gap-2 group"
                          >
                            <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all" />
                            {item}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
