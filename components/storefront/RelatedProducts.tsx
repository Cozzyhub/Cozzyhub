"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  on_sale?: boolean;
  sale_ends_at?: string;
  image_url: string;
  slug: string;
  stock: number;
}

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export default function RelatedProducts({ 
  products, 
  title = "You May Also Like" 
}: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t border-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600">
          Similar products you might be interested in
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
