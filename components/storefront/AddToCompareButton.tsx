"use client";

import { useState, useEffect } from "react";
import { GitCompare } from "lucide-react";
import { comparisonStore } from "@/lib/stores/comparisonStore";

export default function AddToCompareButton({ productId }: { productId: string }) {
  const [isInComparison, setIsInComparison] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setIsInComparison(comparisonStore.has(productId));
    setCount(comparisonStore.count());

    const handleUpdate = () => {
      setIsInComparison(comparisonStore.has(productId));
      setCount(comparisonStore.count());
    };

    window.addEventListener('comparison-updated', handleUpdate);
    return () => window.removeEventListener('comparison-updated', handleUpdate);
  }, [productId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInComparison) {
      comparisonStore.remove(productId);
    } else {
      if (count >= 4) {
        alert('You can compare up to 4 products at a time');
        return;
      }
      comparisonStore.add(productId);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2.5 rounded-full transition-all ${
        isInComparison
          ? "bg-purple-500 text-white"
          : "bg-white/90 text-gray-700 hover:bg-white"
      } shadow-lg hover:scale-110`}
      title={isInComparison ? "Remove from comparison" : "Add to comparison"}
    >
      <GitCompare size={18} />
    </button>
  );
}
