"use client";

import { useState } from "react";
import { Tag, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CouponInputProps {
  onApply: (code: string) => Promise<{
    success: boolean;
    discount: number;
    message: string;
    couponData?: any;
  }>;
  onRemove: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
  } | null;
}

export default function CouponInput({
  onApply,
  onRemove,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onApply(code.toUpperCase());
      
      if (result.success) {
        setCode("");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setError("");
    onRemove();
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  Coupon Applied!
                </p>
                <p className="text-sm text-green-700">
                  <span className="font-mono font-bold">
                    {appliedCoupon.code}
                  </span>{" "}
                  - ₹{appliedCoupon.discount.toFixed(2)} off
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-green-100 rounded-lg transition"
              aria-label="Remove coupon"
            >
              <X size={18} className="text-green-700" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleApply();
                    }
                  }}
                  placeholder="Enter coupon code"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition uppercase"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleApply}
                disabled={loading || !code.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Applying..." : "Apply"}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <X size={14} />
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
