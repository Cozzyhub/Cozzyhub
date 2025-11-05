"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Package, User, MapPin, CreditCard, Calendar, Truck } from "lucide-react";
import { formatINR } from "@/lib/utils/currency";

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

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const subtotal = Number(order.total) + Number(order.discount_amount || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 border border-white/10 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Order Details
                </h2>
                <p className="text-gray-400">Order #{order.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="text-gray-400" size={24} />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border ${
                  statusColors[order.status] || statusColors.pending
                }`}
              >
                <Package size={16} />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="text-pink-400" size={20} />
                  <h3 className="text-white font-semibold">Customer</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">Name:</span>{" "}
                    {order.customer_name || "Guest"}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Email:</span>{" "}
                    {order.customer_email}
                  </p>
                  {order.customer_phone && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">Phone:</span>{" "}
                      {order.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="text-purple-400" size={20} />
                  <h3 className="text-white font-semibold">Order Info</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">Date:</span>{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  {order.estimated_delivery && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">Est. Delivery:</span>{" "}
                      {new Date(order.estimated_delivery).toLocaleDateString()}
                    </p>
                  )}
                  {order.delivered_at && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">Delivered:</span>{" "}
                      {new Date(order.delivered_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="text-green-400" size={20} />
                  <h3 className="text-white font-semibold">Shipping Address</h3>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-line">
                  {order.shipping_address}
                </p>
              </div>

              {/* Tracking Info */}
              {(order.tracking_number || order.courier_name) && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="text-blue-400" size={20} />
                    <h3 className="text-white font-semibold">Tracking</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {order.courier_name && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Courier:</span>{" "}
                        {order.courier_name}
                      </p>
                    )}
                    {order.tracking_number && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Tracking #:</span>{" "}
                        <span className="font-mono">{order.tracking_number}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-pink-400" size={20} />
                <h3 className="text-white font-semibold">Order Items</h3>
              </div>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {item.product_name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-white font-semibold">
                      {formatINR(Number(item.product_price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="text-yellow-400" size={20} />
                <h3 className="text-white font-semibold">Payment Summary</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {order.discount_amount && Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>
                      Discount {order.coupon_code && `(${order.coupon_code})`}
                    </span>
                    <span>-{formatINR(Number(order.discount_amount))}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-pink-400">
                      {formatINR(Number(order.total))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
