"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Package,
  DollarSign,
  Hash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Variant {
  id: string;
  variant_type: string;
  value: string;
  price_adjustment: number;
  stock: number;
  sku: string | null;
  is_available: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface ProductVariantsClientProps {
  product: Product;
  initialVariants: Variant[];
}

export default function ProductVariantsClient({
  product,
  initialVariants,
}: ProductVariantsClientProps) {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    variant_type: "",
    value: "",
    price_adjustment: 0,
    stock: 0,
    sku: "",
    is_available: true,
  });

  const openAddModal = () => {
    setEditingVariant(null);
    setFormData({
      variant_type: "",
      value: "",
      price_adjustment: 0,
      stock: 0,
      sku: "",
      is_available: true,
    });
    setShowModal(true);
  };

  const openEditModal = (variant: Variant) => {
    setEditingVariant(variant);
    setFormData({
      variant_type: variant.variant_type,
      value: variant.value,
      price_adjustment: variant.price_adjustment,
      stock: variant.stock,
      sku: variant.sku || "",
      is_available: variant.is_available,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingVariant
        ? `/api/admin/variants/${editingVariant.id}`
        : "/api/admin/variants";

      const method = editingVariant ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          product_id: product.id,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save variant");
      }
    } catch (error) {
      alert("Failed to save variant");
    } finally {
      setLoading(false);
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/variants/${variantId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setVariants((prev) => prev.filter((v) => v.id !== variantId));
        router.refresh();
      } else {
        alert("Failed to delete variant");
      }
    } catch (error) {
      alert("Failed to delete variant");
    } finally {
      setLoading(false);
    }
  };

  // Group variants by type
  const variantsByType = variants.reduce((acc, variant) => {
    if (!acc[variant.variant_type]) {
      acc[variant.variant_type] = [];
    }
    acc[variant.variant_type].push(variant);
    return acc;
  }, {} as Record<string, Variant[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <button className="p-2 hover:bg-white/10 rounded-lg transition">
              <ArrowLeft className="text-gray-400" size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Product Variants
            </h1>
            <p className="text-gray-400">{product.name}</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
        >
          <Plus size={16} />
          Add Variant
        </button>
      </div>

      {/* Product Info */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <h3 className="text-white font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-400">Base Price: ₹{product.price}</p>
            <p className="text-sm text-gray-500 mt-1">
              {variants.length} variant(s) configured
            </p>
          </div>
        </div>
      </div>

      {/* Variants by Type */}
      {Object.keys(variantsByType).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(variantsByType).map(([type, typeVariants]) => (
            <div
              key={type}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white font-semibold text-lg mb-4 capitalize">
                {type} Variants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeVariants.map((variant, index) => (
                  <motion.div
                    key={variant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{variant.value}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {variant.is_available ? (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                              Available
                            </span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(variant)}
                          className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteVariant(variant.id)}
                          className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign size={14} className="text-gray-500" />
                        <span>
                          {variant.price_adjustment >= 0 ? "+" : ""}₹
                          {variant.price_adjustment} (₹
                          {product.price + variant.price_adjustment})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Package size={14} className="text-gray-500" />
                        <span>{variant.stock} in stock</span>
                      </div>
                      {variant.sku && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Hash size={14} className="text-gray-500" />
                          <span className="font-mono text-xs">{variant.sku}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No variants configured yet</p>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Add First Variant
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingVariant ? "Edit Variant" : "Add Variant"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type *
                  </label>
                  <input
                    type="text"
                    value={formData.variant_type}
                    onChange={(e) =>
                      setFormData({ ...formData, variant_type: e.target.value })
                    }
                    placeholder="e.g., size, color, material"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder="e.g., M, Red, Cotton"
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Adjustment (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_adjustment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_adjustment: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Final price: ₹
                    {(product.price + formData.price_adjustment).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) })
                    }
                    placeholder="0"
                    required
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SKU (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="e.g., PROD-M-001"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData({ ...formData, is_available: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-pink-500 focus:ring-2 focus:ring-pink-500"
                  />
                  <label htmlFor="is_available" className="text-sm text-gray-300">
                    Available for purchase
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editingVariant ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
