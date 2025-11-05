"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/contexts/ToastContext";

interface StockNotifyButtonProps {
  productId: string;
  productName: string;
}

export default function StockNotifyButton({
  productId,
  productName,
}: StockNotifyButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubscribed(true);
        toast.success("You'll be notified when back in stock!");
        setTimeout(() => {
          setShowModal(false);
          setEmail("");
        }, 2000);
      } else {
        toast.error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
      >
        <Bell size={20} />
        Notify When Available
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-indigo-900/95 border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              {!subscribed ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Bell className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Back in Stock Alert
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Get notified via email
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 text-sm">
                    We'll send you an email when <strong>{productName}</strong> is back in stock.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                      >
                        {loading ? "Subscribing..." : "Notify Me"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4"
                  >
                    <Check className="text-green-400" size={32} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    You're Subscribed!
                  </h3>
                  <p className="text-gray-400">
                    We'll email you when this product is back in stock.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
