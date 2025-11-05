"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import QuickViewModal from "./QuickViewModal";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  on_sale?: boolean;
  sale_ends_at?: string;
  image_url: string | null;
  slug: string;
  stock: number;
}

interface ProductsGridProps {
  products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(slug) => setQuickViewSlug(slug)}
          />
        ))}
      </div>

      {quickViewSlug && (
        <QuickViewModal
          isOpen={!!quickViewSlug}
          onClose={() => setQuickViewSlug(null)}
          productSlug={quickViewSlug}
        />
      )}
    </>
  );
}
