"use client";

import { useState, useEffect } from "react";
import { comparisonStore } from "@/lib/stores/comparisonStore";
import { GitCompare, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ComparisonBar() {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const newCount = comparisonStore.count();
      setCount(newCount);
      setIsVisible(newCount > 0);
    };

    updateCount();
    window.addEventListener('comparison-updated', updateCount);
    return () => window.removeEventListener('comparison-updated', updateCount);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link href="/compare">
            <button className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-2xl hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105">
              <GitCompare size={24} />
              <div className="text-left">
                <div className="text-sm opacity-90">Compare</div>
                <div className="text-lg font-bold">{count} Products</div>
              </div>
            </button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
