"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export type SortOption = 
  | "newest"
  | "oldest"
  | "price-low"
  | "price-high"
  | "rating-high"
  | "rating-low"
  | "name-asc"
  | "name-desc";

interface SortOptionConfig {
  value: SortOption;
  label: string;
  description: string;
}

const sortOptions: SortOptionConfig[] = [
  { value: "newest", label: "Newest First", description: "Recently added" },
  { value: "oldest", label: "Oldest First", description: "Earliest added" },
  { value: "price-low", label: "Price: Low to High", description: "Cheapest first" },
  { value: "price-high", label: "Price: High to Low", description: "Most expensive first" },
  { value: "rating-high", label: "Rating: High to Low", description: "Best rated first" },
  { value: "rating-low", label: "Rating: Low to High", description: "Lowest rated first" },
  { value: "name-asc", label: "Name: A to Z", description: "Alphabetical" },
  { value: "name-desc", label: "Name: Z to A", description: "Reverse alphabetical" },
];

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // Reset to page 1 when sorting changes
    router.push(`/products?${params.toString()}`);
  };

  const currentOption = sortOptions.find((opt) => opt.value === currentSort);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-gray-700">
        <ArrowUpDown size={18} />
        <span className="font-medium text-sm">Sort by:</span>
      </div>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value as SortOption)}
        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium text-sm hover:border-pink-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 smooth-transition cursor-pointer outline-none"
        aria-label="Sort products"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {currentOption && (
        <span className="hidden md:inline text-xs text-gray-500">
          {currentOption.description}
        </span>
      )}
    </div>
  );
}
