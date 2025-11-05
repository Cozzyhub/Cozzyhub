"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { useScrollPosition } from "@/lib/hooks/useScrollPosition";

export default function Categories() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPosition = useScrollPosition();

  // Move to top when scrolled past hero (approx 400px)
  const shouldMoveToTop = scrollPosition > 400;

  const handleMouseEnter = useCallback(
    (categoryName: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (hoveredCategory !== categoryName) {
        setHoveredCategory(categoryName);
      }
      if (!megaMenuOpen) {
        setMegaMenuOpen(true);
      }
    },
    [hoveredCategory, megaMenuOpen],
  );

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setMegaMenuOpen(false);
    }, 100);
  }, []);

  const cancelLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hoveredCategoryData = useMemo(
    () => categories.find((cat) => cat.name === hoveredCategory),
    [hoveredCategory],
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={`sticky frosted-nav shadow-md smooth-transition ${
          shouldMoveToTop ? 'z-50' : 'z-40'
        }`}
        animate={{ 
          top: shouldMoveToTop ? 0 : 64
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: shouldMoveToTop ? 'top' : 'auto' }}
      >
        {/* Horizontal Category Bar */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex md:flex-wrap items-center md:justify-center gap-2 py-3 overflow-x-auto md:overflow-visible scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isHovered = hoveredCategory === category.name;
              return (
                <div
                  key={category.name}
                  onMouseEnter={() => handleMouseEnter(category.name)}
                  onMouseLeave={handleMouseLeave}
                  className="relative"
                  style={{ willChange: isHovered ? "transform" : "auto" }}
                >
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap smooth-transition ${
                      isHovered
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                    }`}
                  >
                    <span className="grid place-items-center">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-semibold">
                      {category.name}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        transform: isHovered
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </button>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full"
                    style={{
                      transformOrigin: "left",
                      transform: `scaleX(${isHovered ? 1 : 0})`,
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence mode="wait">
          {megaMenuOpen && hoveredCategoryData && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              onMouseEnter={cancelLeave}
              onMouseLeave={handleMouseLeave}
              className="absolute left-0 right-0 top-full frosted-nav shadow-xl smooth-transition"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {hoveredCategoryData.subcategories.map((subcategory) => (
                    <div key={subcategory.title} className="space-y-3">
                      <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wide border-b border-pink-200 pb-2 flex items-center gap-2 transition-colors duration-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600" />
                        {subcategory.title}
                      </h4>
                      <ul className="space-y-2">
                        {subcategory.items.map((item) => (
                          <li key={item}>
                            <Link
                              href={`/products?category=${encodeURIComponent(hoveredCategoryData.name)}&subcategory=${encodeURIComponent(item)}`}
                              className="text-gray-600 hover:text-pink-600 text-sm transition-colors duration-200 inline-flex items-center gap-2 group"
                            >
                              <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-pink-600 transition-colors duration-200" />
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </LazyMotion>
  );
}
