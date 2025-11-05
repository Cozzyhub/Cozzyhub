"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Variant {
  id: string;
  variant_type: string;
  value: string;
  price_adjustment: number;
  stock: number;
  is_available: boolean;
}

interface ProductVariantSelectorProps {
  productId: string;
  basePrice: number;
  onVariantChange?: (variant: Variant | null, totalPrice: number) => void;
}

export default function ProductVariantSelector({
  productId,
  basePrice,
  onVariantChange,
}: ProductVariantSelectorProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Variant>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/variants`);
      if (res.ok) {
        const data = await res.json();
        setVariants(data.variants || []);
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    } finally {
      setLoading(false);
    }
  };

  const variantsByType = variants.reduce((acc, variant) => {
    if (!acc[variant.variant_type]) {
      acc[variant.variant_type] = [];
    }
    acc[variant.variant_type].push(variant);
    return acc;
  }, {} as Record<string, Variant[]>);

  const selectVariant = (type: string, variant: Variant) => {
    const newSelected = { ...selectedVariants, [type]: variant };
    setSelectedVariants(newSelected);

    // Calculate total price with adjustments
    const totalAdjustment = Object.values(newSelected).reduce(
      (sum, v) => sum + Number(v.price_adjustment || 0),
      0
    );
    const totalPrice = basePrice + totalAdjustment;

    // Notify parent
    if (onVariantChange) {
      onVariantChange(variant, totalPrice);
    }
  };

  const getTotalPrice = () => {
    const totalAdjustment = Object.values(selectedVariants).reduce(
      (sum, v) => sum + Number(v.price_adjustment || 0),
      0
    );
    return basePrice + totalAdjustment;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-16 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {Object.entries(variantsByType).map(([type, typeVariants]) => (
        <div key={type}>
          <h3 className="text-white font-semibold mb-3 capitalize">
            {type}:
            {selectedVariants[type] && (
              <span className="ml-2 text-pink-400">{selectedVariants[type].value}</span>
            )}
          </h3>

          <div className="flex flex-wrap gap-2">
            {typeVariants.map((variant) => {
              const isSelected = selectedVariants[type]?.id === variant.id;
              const isDisabled = !variant.is_available || variant.stock === 0;

              return (
                <motion.button
                  key={variant.id}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  onClick={() => !isDisabled && selectVariant(type, variant)}
                  disabled={isDisabled}
                  className={`relative px-4 py-2 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-pink-500"
                      : isDisabled
                        ? "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                        : "bg-white/10 text-white border border-white/20 hover:border-pink-500"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5"
                    >
                      <Check size={12} className="text-white" />
                    </motion.div>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Color preview for color variants */}
                    {type === "color" && (
                      <div
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{ backgroundColor: variant.value.toLowerCase() }}
                      />
                    )}

                    <span>{variant.value}</span>

                    {variant.price_adjustment !== 0 && (
                      <span className="text-xs">
                        {variant.price_adjustment > 0 ? "+" : ""}
                        ₹{Math.abs(variant.price_adjustment)}
                      </span>
                    )}
                  </div>

                  {isDisabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 transform rotate-45 opacity-50" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {selectedVariants[type] && selectedVariants[type].stock < 5 && (
            <p className="text-yellow-400 text-sm mt-2">
              Only {selectedVariants[type].stock} left in stock!
            </p>
          )}
        </div>
      ))}

      {Object.keys(selectedVariants).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Total Price:</span>
            <span className="text-2xl font-bold text-white">
              ₹{getTotalPrice().toFixed(2)}
            </span>
          </div>
          {getTotalPrice() !== basePrice && (
            <p className="text-sm text-gray-400 mt-1">
              Base: ₹{basePrice} + ₹
              {(getTotalPrice() - basePrice).toFixed(2)} variant
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
