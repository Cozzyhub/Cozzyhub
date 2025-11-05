"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils/currency";
import SimpleBarChart from "./SimpleBarChart";
import { motion } from "framer-motion";
import LowStockBadge from "./LowStockBadge";

interface Analytics {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProducts: number;
    activeProducts: number;
    revenueGrowth: number;
    orderGrowth: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueChart: Array<{
    date: string;
    revenue: number;
  }>;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  period: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
  image_url?: string;
}

interface InventoryAlerts {
  products: LowStockProduct[];
  stats: {
    total: number;
    outOfStock: number;
    critical: number;
    low: number;
  };
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlerts | null>(null);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchInventoryAlerts();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryAlerts = async () => {
    try {
      const response = await fetch("/api/admin/inventory-alerts?threshold=10");
      if (response.ok) {
        const data = await response.json();
        setInventoryAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Revenue",
      value: formatINR(analytics.overview.totalRevenue),
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      growth: analytics.overview.revenueGrowth,
    },
    {
      name: "Total Orders",
      value: analytics.overview.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-500",
      growth: analytics.overview.orderGrowth,
    },
    {
      name: "Average Order",
      value: formatINR(analytics.overview.averageOrderValue),
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      growth: null,
    },
    {
      name: "Active Products",
      value: `${analytics.overview.activeProducts}/${analytics.overview.totalProducts}`,
      icon: Package,
      color: "from-orange-500 to-red-500",
      growth: null,
    },
  ];

  const statusColors: { [key: string]: string } = {
    pending: "bg-gray-500/20 text-gray-300",
    processing: "bg-yellow-500/20 text-yellow-300",
    shipped: "bg-blue-500/20 text-blue-300",
    delivered: "bg-green-500/20 text-green-300",
    cancelled: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Analytics and insights</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-1">
          {["7", "30", "90"].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                period === days
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
                {stat.growth !== null && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.growth >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {stat.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(stat.growth)}%
                  </div>
                )}
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">
                {stat.name}
              </h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
          <Calendar className="text-gray-400" size={20} />
        </div>
        <SimpleBarChart data={analytics.revenueChart} height={250} />
      </div>

      {/* Inventory Alerts */}
      {inventoryAlerts && inventoryAlerts.stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Inventory Alerts</h2>
                <p className="text-gray-400 text-sm">
                  {inventoryAlerts.stats.total} product{inventoryAlerts.stats.total !== 1 ? 's' : ''} need attention
                </p>
              </div>
            </div>
            <Link
              href="/admin/inventory-alerts"
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-medium transition"
            >
              View All
            </Link>
          </div>

          {/* Alert Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm font-medium mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-white">{inventoryAlerts.stats.outOfStock}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-orange-400 text-sm font-medium mb-1">Critical Level</p>
              <p className="text-3xl font-bold text-white">{inventoryAlerts.stats.critical}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-medium mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-white">{inventoryAlerts.stats.low}</p>
            </div>
          </div>

          {/* Top 5 Products Needing Attention */}
          <div className="space-y-3">
            {inventoryAlerts.products.slice(0, 5).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">Stock: {product.stock}</p>
                  </div>
                </div>
                <LowStockBadge stock={product.stock} threshold={10} size="sm" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="text-yellow-400" size={20} />
            <h2 className="text-xl font-bold text-white">Top Products</h2>
          </div>
          <div className="space-y-4">
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-gray-400 text-sm">
                        {product.quantity} sold
                      </p>
                    </div>
                  </div>
                  <p className="text-green-400 font-semibold">
                    {formatINR(product.revenue)}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">
                No sales data available
              </p>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Orders by Status</h2>
          <div className="space-y-4">
            {Object.entries(analytics.ordersByStatus).map(([status, count], index) => {
              const total = Object.values(analytics.ordersByStatus).reduce(
                (sum, val) => sum + val,
                0
              );
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}
                      >
                        {status}
                      </span>
                      <span className="text-gray-400 text-sm">{count}</span>
                    </div>
                    <span className="text-white font-medium">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
