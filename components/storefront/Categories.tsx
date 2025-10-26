"use client";

import {
  Shirt,
  Home,
  Smartphone,
  Sparkles,
  Baby,
  Watch,
  Package,
  Gem,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  {
    name: "Women’s Ethnic Wear",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Men’s Apparel",
    icon: Shirt,
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Kids’ Clothing & Accessories",
    icon: Baby,
    color: "from-green-500 to-emerald-500",
  },
  { name: "Home & Kitchen", icon: Home, color: "from-blue-500 to-cyan-500" },
  {
    name: "Beauty & Personal Care",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Electronics & Mobile Accessories",
    icon: Smartphone,
    color: "from-purple-500 to-indigo-500",
  },
  {
    name: "Fashion Accessories",
    icon: Gem,
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    name: "Daily-Use / General Merchandise",
    icon: Package,
    color: "from-slate-500 to-gray-500",
  },
  { name: "Anime", icon: Star, color: "from-yellow-400 to-amber-500" },
];

export default function Categories() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white mb-8 text-center"
        >
          Shop by Category
        </motion.h2>

        <div className="relative">
          {/* Horizontal Scroll Container */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link href="/products" key={category.name}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 snap-start"
                  >
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/15 transition-all shadow-lg">
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon size={28} className="text-white" />
                      </div>
                      <p className="text-white text-sm font-semibold text-center">
                        {category.name}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
