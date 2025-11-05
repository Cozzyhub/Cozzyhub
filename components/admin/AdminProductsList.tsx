"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Star,
  StarOff,
  AlertTriangle,
  Package,
  Layers,
} from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import StockManagementModal from "./StockManagementModal";
import LowStockBadge from "./LowStockBadge";
import { formatINR } from "@/lib/utils/currency";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  categories: { name: string } | null;
}

interface AdminProductsListProps {
  initialProducts: Product[];
}

export default function AdminProductsList({
  initialProducts,
}: AdminProductsListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);

  const allSelected = selectedIds.size === initialProducts.length && initialProducts.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialProducts.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (action: string) => {
    setBulkAction(action);
    if (action === "delete") {
      setShowBulkConfirm(true);
    } else {
      await executeBulkAction(action);
    }
  };

  const executeBulkAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productIds: Array.from(selectedIds),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to perform bulk action");
      }

      // Clear selections and refresh
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
      router.refresh();
    } catch (error: any) {
      console.error("Bulk action error:", error);
      alert(error.message || "Failed to perform bulk action");
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "delete":
        return "Delete";
      case "activate":
        return "Activate";
      case "deactivate":
        return "Deactivate";
      case "feature":
        return "Mark as Featured";
      case "unfeature":
        return "Remove Featured";
      default:
        return action;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition">
            <Plus size={20} />
            Add Product
          </button>
        </Link>
      </div>

      {/* Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-purple-500/20 border border-purple-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-gray-300 hover:text-white text-sm underline"
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                >
                  <Eye size={16} />
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition disabled:opacity-50"
                >
                  <EyeOff size={16} />
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("feature")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition disabled:opacity-50"
                >
                  <Star size={16} />
                  Feature
                </button>
                <button
                  onClick={() => handleBulkAction("unfeature")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition disabled:opacity-50"
                >
                  <StarOff size={16} />
                  Unfeature
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="p-4 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {allSelected ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Product
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Category
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Price
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Stock
                </th>
                <th className="text-left text-gray-400 font-medium p-4">
                  Status
                </th>
                <th className="text-right text-gray-400 font-medium p-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {initialProducts?.map((product) => (
                <tr
                  key={product.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition ${
                    selectedIds.has(product.id) ? "bg-purple-500/10" : ""
                  }`}
                >
                  <td className="p-4">
                    <button
                      onClick={() => toggleSelect(product.id)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      {selectedIds.has(product.id) ? (
                        <CheckSquare size={20} className="text-purple-400" />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-gray-400 text-sm">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">
                    {product.categories?.name || "Uncategorized"}
                  </td>
                  <td className="p-4 text-white font-semibold">
                    {formatINR(Number(product.price))}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStockModalProduct(product)}
                        className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition group"
                      >
                        <Package size={14} className="text-gray-400 group-hover:text-purple-400 transition" />
                        <span className="text-white font-semibold">{product.stock}</span>
                      </button>
                      {product.stock <= 10 && (
                        <LowStockBadge stock={product.stock} threshold={10} showText={false} size="sm" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.is_active
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                      {product.is_featured && (
                        <Star
                          size={16}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/variants`}>
                        <button 
                          className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                          title="Manage Variants"
                        >
                          <Layers size={18} />
                        </button>
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!initialProducts || initialProducts.length === 0) && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No products yet. Create your first product!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowBulkConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertTriangle className="text-red-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Confirm Bulk Delete
                      </h3>
                      <p className="text-gray-400 text-sm">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-white">
                      {selectedIds.size}
                    </span>{" "}
                    product{selectedIds.size !== 1 ? "s" : ""}?
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowBulkConfirm(false)}
                      className="flex-1 px-4 py-3 bg-white/5 text-gray-300 font-semibold rounded-lg hover:bg-white/10 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => executeBulkAction("delete")}
                      className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Stock Management Modal */}
      {stockModalProduct && (
        <StockManagementModal
          product={{
            id: stockModalProduct.id,
            name: stockModalProduct.name,
            stock: stockModalProduct.stock,
            image_url: stockModalProduct.image_url || undefined,
          }}
          isOpen={!!stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          onSuccess={() => {
            setStockModalProduct(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
