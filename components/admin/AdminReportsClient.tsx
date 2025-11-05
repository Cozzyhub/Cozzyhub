"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  Calendar,
  Package,
  BarChart3,
} from "lucide-react";
import SimpleBarChart from "./SimpleBarChart";

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  order_items: any[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
}

interface Customer {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
}

interface AdminReportsClientProps {
  initialOrders: Order[];
  initialProducts: Product[];
  initialCustomers: Customer[];
}

export default function AdminReportsClient({
  initialOrders,
  initialProducts,
  initialCustomers,
}: AdminReportsClientProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    if (period === "all") return initialOrders;

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return initialOrders.filter(
      (order) => new Date(order.created_at) >= cutoffDate
    );
  }, [initialOrders, period]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by day
    const revenueByDay: Record<string, number> = {};
    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      revenueByDay[date] = (revenueByDay[date] || 0) + Number(order.total);
    });

    // Orders by status
    const ordersByStatus = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top products
    const productSales: Record<string, { quantity: number; revenue: number; name: string }> = {};
    filteredOrders.forEach((order) => {
      order.order_items?.forEach((item: any) => {
        const productName = item.product_name;
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0, name: productName };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += Number(item.product_price) * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // New customers in period
    const newCustomers = initialCustomers.filter((c) => {
      if (period === "all") return true;
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return new Date(c.created_at) >= cutoffDate;
    }).length;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueByDay,
      ordersByStatus,
      topProducts,
      newCustomers,
    };
  }, [filteredOrders, initialCustomers, period]);

  // Export functions
  const exportSalesReport = () => {
    const csvData = [
      ["Date", "Order ID", "Customer", "Total", "Status"],
      ...filteredOrders.map((order) => [
        new Date(order.created_at).toLocaleDateString(),
        order.id.slice(0, 8),
        "-", // Customer name if available
        Number(order.total).toFixed(2),
        order.status,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    downloadCSV(csvContent, `sales-report-${period}.csv`);
  };

  const exportProductsReport = () => {
    const csvData = [
      ["Product", "Price", "Stock", "Status"],
      ...initialProducts.map((product) => [
        product.name,
        product.price.toFixed(2),
        product.stock.toString(),
        product.is_active ? "Active" : "Inactive",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    downloadCSV(csvContent, "products-report.csv");
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Prepare chart data
  const revenueChartData = Object.entries(metrics.revenueByDay)
    .slice(-14) // Last 14 days
    .map(([date, revenue]) => ({
      date,
      revenue,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportSalesReport}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
          >
            <Download size={16} />
            Export Sales
          </button>
          <button
            onClick={exportProductsReport}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
          >
            <Download size={16} />
            Export Products
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="text-gray-400" size={20} />
        <span className="text-gray-400 text-sm mr-2">Period:</span>
        {["7d", "30d", "90d", "all"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              period === p
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : "All Time"}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-400" size={24} />
            <span className="text-gray-400">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{metrics.totalRevenue.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="text-blue-400" size={24} />
            <span className="text-gray-400">Total Orders</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.totalOrders}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-purple-400" size={24} />
            <span className="text-gray-400">Avg Order Value</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{metrics.avgOrderValue.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-orange-400" size={24} />
            <span className="text-gray-400">New Customers</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.newCustomers}</p>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-pink-400" size={24} />
          <h3 className="text-white font-semibold text-lg">Revenue Over Time</h3>
        </div>
        <SimpleBarChart data={revenueChartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-purple-400" size={24} />
            <h3 className="text-white font-semibold text-lg">Top Products</h3>
          </div>
          <div className="space-y-3">
            {metrics.topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">{product.quantity} sold</p>
                  </div>
                </div>
                <p className="text-white font-bold">₹{product.revenue.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-blue-400" size={24} />
            <h3 className="text-white font-semibold text-lg">Orders by Status</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(metrics.ordersByStatus).map(([status, count], index) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white capitalize">{status}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(count / metrics.totalOrders) * 100}%`,
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Inventory Summary */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Inventory Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Products</p>
            <p className="text-2xl font-bold text-white">{initialProducts.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Active Products</p>
            <p className="text-2xl font-bold text-green-400">
              {initialProducts.filter((p) => p.is_active).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Low Stock (&lt;10)</p>
            <p className="text-2xl font-bold text-yellow-400">
              {initialProducts.filter((p) => p.stock < 10).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
