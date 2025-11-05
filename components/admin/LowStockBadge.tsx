"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Package } from "lucide-react";

interface LowStockBadgeProps {
  stock: number;
  threshold?: number;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function LowStockBadge({
  stock,
  threshold = 10,
  showText = true,
  size = "md",
}: LowStockBadgeProps) {
  // Determine severity level
  const isOutOfStock = stock === 0;
  const isCritical = stock > 0 && stock <= threshold / 2;
  const isLow = stock > threshold / 2 && stock <= threshold;

  if (stock > threshold) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  // Color scheme based on severity
  const colors = isOutOfStock
    ? {
        bg: "bg-red-100",
        border: "border-red-300",
        text: "text-red-700",
        icon: "text-red-500",
      }
    : isCritical
    ? {
        bg: "bg-orange-100",
        border: "border-orange-300",
        text: "text-orange-700",
        icon: "text-orange-500",
      }
    : {
        bg: "bg-yellow-100",
        border: "border-yellow-300",
        text: "text-yellow-700",
        icon: "text-yellow-500",
      };

  const label = isOutOfStock
    ? "Out of Stock"
    : isCritical
    ? `Critical: ${stock} left`
    : `Low Stock: ${stock}`;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        ${colors.bg} ${colors.border} ${colors.text}
        ${sizeClasses[size]}
        font-medium
      `}
    >
      {isOutOfStock ? (
        <Package size={iconSizes[size]} className={colors.icon} />
      ) : (
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
        >
          <AlertTriangle size={iconSizes[size]} className={colors.icon} />
        </motion.div>
      )}
      {showText && <span>{label}</span>}
    </motion.div>
  );
}
