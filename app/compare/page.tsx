"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/storefront/Navbar";
import { comparisonStore } from "@/lib/stores/comparisonStore";
import { formatINR } from "@/lib/utils/currency";
import { X, Star, Check, Minus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image_url: string;
  description: string | null;
  category: string | null;
  stock: number;
  average_rating: number | null;
  is_featured: boolean;
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => loadProducts();
    window.addEventListener('comparison-updated', handleUpdate);
    return () => window.removeEventListener('comparison-updated', handleUpdate);
  }, []);

  const loadProducts = async () => {
    const ids = comparisonStore.get();
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', ids);

    setProducts(data || []);
    setLoading(false);
  };

  const handleRemove = (id: string) => {
    comparisonStore.remove(id);
  };

  const handleClearAll = () => {
    comparisonStore.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center py-20">
            <div className="inline-block p-12 bg-white rounded-2xl shadow-lg">
              <ShoppingCart size={64} className="text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No products to compare</h2>
              <p className="text-gray-600 mb-6">Add products to comparison to see them here</p>
              <Link href="/products">
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition">
                  Browse Products
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    { label: 'Price', key: 'price', format: (v: any) => formatINR(v) },
    { label: 'Original Price', key: 'original_price', format: (v: any) => v ? formatINR(v) : 'N/A' },
    { label: 'Rating', key: 'average_rating', format: (v: any) => v ? `${v}★` : 'No ratings' },
    { label: 'Category', key: 'category', format: (v: any) => v || 'N/A' },
    { label: 'Stock Status', key: 'stock', format: (v: any) => v > 0 ? `${v} in stock` : 'Out of stock' },
    { label: 'Featured', key: 'is_featured', format: (v: any) => v ? 'Yes' : 'No' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
              Compare Products
            </h1>
            <p className="text-gray-600">Compare up to 4 products side-by-side</p>
          </div>
          <button
            onClick={handleClearAll}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
          >
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-left bg-gray-50 font-semibold text-gray-900 sticky left-0 z-10 min-w-[200px]">
                      Feature
                    </th>
                    {products.map((product, idx) => (
                      <th key={product.id} className="p-4 bg-gray-50 min-w-[250px]">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="relative"
                        >
                          <button
                            onClick={() => handleRemove(product.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition z-20"
                          >
                            <X size={16} />
                          </button>
                          <Link href={`/products/${product.slug}`}>
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                          </Link>
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-pink-600 transition line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                        </motion.div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, idx) => (
                    <tr key={feature.key} className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                        {feature.label}
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 text-center">
                          <span className="text-gray-700">
                            {feature.format(product[feature.key as keyof Product])}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  {/* Description Row */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      Description
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4">
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {product.description || 'No description available'}
                        </p>
                      </td>
                    ))}
                  </tr>
                  
                  {/* Action Row */}
                  <tr>
                    <td className="p-4 bg-gray-50 sticky left-0 z-10"></td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4">
                        <Link href={`/products/${product.slug}`}>
                          <button className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition">
                            View Details
                          </button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add more products hint */}
        {products.length < 4 && (
          <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <p className="text-purple-900 font-medium">
              You can add up to {4 - products.length} more product{4 - products.length !== 1 ? 's' : ''} for comparison
            </p>
            <Link href="/products">
              <button className="mt-4 px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-100 transition border border-purple-300">
                Browse More Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
