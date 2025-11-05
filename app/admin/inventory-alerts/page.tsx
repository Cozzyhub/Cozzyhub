"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Package,
  Search,
  Settings,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import LowStockBadge from "@/components/admin/LowStockBadge";
import { formatINR } from "@/lib/utils/currency";

interface Product {
  id: string;
  name: string;
  slug: string;
  stock: number;
  price: number;
  image_url?: string;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface InventoryData {
  products: Product[];
  stats: {
    total: number;
    outOfStock: number;
    critical: number;
    low: number;
    threshold: number;
  };
}

export default function InventoryAlertsPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("stock");
  const [order, setOrder] = useState("asc");

  useEffect(() => {
    fetchData();
  }, [threshold, sortBy, order]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/inventory-alerts?threshold=${threshold}&sortBy=${sortBy}&order=${order}`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = data?.products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSort = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Inventory Alerts
          </h1>
          <p className="text-gray-400">
            Manage low stock and out of stock products
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-red-400" size={20} />
              <p className="text-red-300 font-medium">Out of Stock</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.stats.outOfStock}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-orange-400" size={20} />
              <p className="text-orange-300 font-medium">Critical Level</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.stats.critical}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-yellow-400" size={20} />
              <p className="text-yellow-300 font-medium">Low Stock</p>
            </div>
            <p className="text-3xl font-bold text-white">{data.stats.low}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings className="text-purple-400" size={20} />
              <p className="text-gray-300 font-medium">Total Alerts</p>
            </div>
            <p className="text-3xl font-bold text-white">{data.stats.total}</p>
          </motion.div>
        </div>
      )}

      {/* Controls */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Threshold */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm">Threshold:</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
              className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              min="1"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="stock">Stock Level</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
            <button
              onClick={toggleSort}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
            >
              <ArrowUpDown size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {product.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {product.is_active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {formatINR(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <LowStockBadge stock={product.stock} threshold={threshold} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/products?search=${product.slug}`}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
                      >
                        Manage Stock
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            No Alerts Found
          </h3>
          <p className="text-gray-400">
            All products are currently well-stocked!
          </p>
        </div>
      )}
    </div>
  );
}
