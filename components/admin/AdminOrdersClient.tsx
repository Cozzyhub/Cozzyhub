"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Download,
} from "lucide-react";
import { formatINR } from "@/lib/utils/currency";
import UpdateOrderStatus from "./UpdateOrderStatus";
import OrderDetailModal from "./OrderDetailModal";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  product_price: string | number;
  product_image?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: string | number;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  tracking_number: string | null;
  courier_name: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  coupon_code: string | null;
  discount_amount: string | number;
  order_items: OrderItem[];
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
  initialParams: { status?: string; search?: string };
}

export default function AdminOrdersClient({
  initialOrders,
  initialParams,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [orders] = useState<Order[]>(initialOrders);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const bulkAction = async (action: string, status?: string) => {
    if (selectedOrders.size === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_ids: Array.from(selectedOrders),
          action,
          status,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setSelectedOrders(new Set());
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch (error) {
      alert("Failed to perform bulk action");
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = () => {
    // Simple CSV export
    const csvData = [
      ["Order ID", "Date", "Customer", "Email", "Status", "Total"],
      ...orders.map((o) => [
        o.id.slice(0, 8),
        new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        o.customer_name || "Guest",
        o.customer_email,
        o.status,
        Number(o.total).toFixed(2),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-gray-400">Manage customer orders</p>
        </div>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-purple-400" />
          <h3 className="text-white font-semibold">Filters</h3>
        </div>

        <form
          action="/admin/orders"
          method="GET"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="search"
              placeholder="Search by customer, email, or order ID..."
              defaultValue={initialParams.search}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={initialParams.status || "all"}
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedOrders.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-white font-semibold">
                {selectedOrders.size} order(s) selected
              </span>
              <button
                onClick={() => setSelectedOrders(new Set())}
                className="text-gray-400 hover:text-white transition text-sm"
              >
                Clear
              </button>
              <div className="flex-1" />
              <button
                onClick={() => bulkAction("update_status", "processing")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition font-semibold disabled:opacity-50"
              >
                <Package size={16} />
                Mark Processing
              </button>
              <button
                onClick={() => bulkAction("mark_shipped")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition font-semibold disabled:opacity-50"
              >
                <Truck size={16} />
                Mark Shipped
              </button>
              <button
                onClick={() => bulkAction("mark_delivered")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition font-semibold disabled:opacity-50"
              >
                <CheckCircle size={16} />
                Mark Delivered
              </button>
              <button
                onClick={() => bulkAction("cancel")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition font-semibold disabled:opacity-50"
              >
                <XCircle size={16} />
                Cancel Orders
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length > 0 && (
          <div className="flex items-center gap-2 px-4">
            <button onClick={toggleSelectAll} className="hover:opacity-70">
              {selectedOrders.size === orders.length ? (
                <CheckSquare className="text-pink-500" size={20} />
              ) : (
                <Square className="text-gray-400" size={20} />
              )}
            </button>
            <span className="text-gray-400 text-sm">Select All</span>
          </div>
        )}

        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`backdrop-blur-xl bg-white/5 border rounded-2xl p-6 transition-colors ${
              selectedOrders.has(order.id)
                ? "border-pink-500/50 bg-pink-500/5"
                : "border-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button
                onClick={() => toggleSelectOrder(order.id)}
                className="mt-1 hover:opacity-70"
              >
                {selectedOrders.has(order.id) ? (
                  <CheckSquare className="text-pink-500" size={20} />
                ) : (
                  <Square className="text-gray-400" size={20} />
                )}
              </button>

              {/* Order Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailOrder(order)}
                      className="p-2 hover:bg-white/10 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="text-gray-400" size={20} />
                    </button>
                    <UpdateOrderStatus
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Customer</p>
                    <p className="text-white">{order.customer_name || "Guest"}</p>
                    <p className="text-gray-300 text-sm">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total</p>
                    <p className="text-2xl font-bold text-white">
                      {formatINR(Number(order.total))}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">
                    {order.order_items?.length || 0} item(s)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Package size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </div>
  );
}
