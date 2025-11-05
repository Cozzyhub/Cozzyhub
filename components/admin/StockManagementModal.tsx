"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Package, History, Save } from "lucide-react";

interface StockManagementModalProps {
  product: {
    id: string;
    name: string;
    stock: number;
    image_url?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface HistoryEntry {
  id: string;
  previous_stock: number;
  new_stock: number;
  adjustment: number;
  reason?: string;
  created_at: string;
  admin: {
    full_name?: string;
    email: string;
  };
}

export default function StockManagementModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: StockManagementModalProps) {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setAdjustment(0);
      setReason("");
      setError("");
    }
  }, [isOpen, product.id]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(
        `/api/admin/stock/history?productId=${product.id}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adjustment === 0) {
      setError("Adjustment cannot be zero");
      return;
    }

    const newStock = product.stock + adjustment;
    if (newStock < 0) {
      setError("Stock cannot be negative");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/stock/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          adjustment,
          reason: reason.trim() || undefined,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const quickAdjust = (amount: number) => {
    setAdjustment(adjustment + amount);
  };

  const newStock = product.stock + adjustment;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl backdrop-blur-xl bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Stock Management
                    </h2>
                    <p className="text-gray-400 text-sm">{product.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Current Stock */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Current Stock</p>
                      <p className="text-3xl font-bold text-white">
                        {product.stock}
                      </p>
                    </div>
                    <Package className="text-purple-400" size={32} />
                  </div>
                </div>

                {/* Adjustment Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Quick Adjust Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quick Adjust
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {[-100, -50, -10, 10, 50, 100].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => quickAdjust(amount)}
                          className={`py-2 rounded-lg font-medium text-sm transition ${
                            amount < 0
                              ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                              : "bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                          }`}
                        >
                          {amount > 0 ? `+${amount}` : amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Adjustment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Manual Adjustment
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjustment(adjustment - 1)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition"
                      >
                        <Minus size={20} />
                      </button>
                      <input
                        type="number"
                        value={adjustment}
                        onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setAdjustment(adjustment + 1)}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg transition"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  {/* New Stock Preview */}
                  {adjustment !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        newStock < 0
                          ? "bg-red-500/10 border-red-500/30"
                          : adjustment > 0
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <p className="text-sm text-gray-300 mb-1">New Stock</p>
                      <p className="text-2xl font-bold text-white">
                        {product.stock} {adjustment > 0 ? "+" : ""}{adjustment} = {newStock}
                      </p>
                    </motion.div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., Restocked, Sold, Damaged..."
                      rows={3}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || adjustment === 0 || newStock < 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Save size={20} />
                    {loading ? "Updating..." : "Update Stock"}
                  </button>
                </form>

                {/* Recent History */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="text-gray-400" size={20} />
                    <h3 className="text-lg font-bold text-white">Recent History</h3>
                  </div>

                  {loadingHistory ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                    </div>
                  ) : history.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm"
                        >
                          <div className="flex-1">
                            <p className="text-white">
                              <span className="font-semibold">
                                {entry.previous_stock}
                              </span>{" "}
                              →{" "}
                              <span className="font-semibold">
                                {entry.new_stock}
                              </span>
                              <span className={`ml-2 ${entry.adjustment > 0 ? "text-green-400" : "text-red-400"}`}>
                                ({entry.adjustment > 0 ? "+" : ""}{entry.adjustment})
                              </span>
                            </p>
                            {entry.reason && (
                              <p className="text-gray-400 text-xs mt-1">
                                {entry.reason}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs">
                              {entry.admin.full_name || entry.admin.email}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">No history yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
