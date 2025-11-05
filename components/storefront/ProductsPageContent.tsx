"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import ProductsGrid from "./ProductsGrid";
import ProductFilters from "./ProductFilters";
import Pagination from "@/components/ui/Pagination";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image_url: string | null;
  [key: string]: any;
}

interface ProductsPageContentProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  count: number | null;
  queryParams: Record<string, string>;
  hasFilters: boolean;
}

export default function ProductsPageContent({
  products,
  currentPage,
  totalPages,
  count,
  queryParams,
  hasFilters,
}: ProductsPageContentProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex gap-8">
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <ProductFilters isOpen={true} onClose={() => {}} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-pink-500 transition"
          >
            <Filter size={20} />
            <span className="font-medium">Filters</span>
            {hasFilters && (
              <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Panel */}
        <ProductFilters 
          isOpen={filtersOpen} 
          onClose={() => setFiltersOpen(false)} 
        />

        {/* Active Filters Badge */}
        {hasFilters && (
          <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-pink-900 font-medium">
              Filters applied
            </span>
            <a
              href="/products"
              className="text-sm text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
            >
              Clear all
              <X size={16} />
            </a>
          </div>
        )}

        {/* Results count */}
        {count !== null && count > 0 && (
          <p className="text-gray-500 text-sm mb-6">
            {count} {count === 1 ? "product" : "products"} found
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </p>
        )}

        {/* Products Grid */}
        <ProductsGrid products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/products"
              queryParams={queryParams}
            />
          </div>
        )}

        {/* Empty State */}
        {(!products || products.length === 0) && (
          <div className="text-center py-12">
            <div className="glass-card rounded-2xl p-12 inline-block">
              <p className="text-gray-600 text-lg mb-2">
                No products found matching your filters.
              </p>
              <a
                href="/products"
                className="text-pink-600 hover:text-pink-700 underline transition-colors"
              >
                Clear filters and view all products
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
