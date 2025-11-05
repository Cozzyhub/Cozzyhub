"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
}: DeleteCategoryButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      router.refresh();
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
        title="Delete category"
      >
        <Trash2 size={18} />
      </button>

      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Confirmation Modal */}
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
                        Delete Category
                      </h3>
                      <p className="text-gray-400 text-sm">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-300 mb-2">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-white">
                        {categoryName}
                      </span>
                      ?
                    </p>
                    {productCount > 0 && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-300 text-sm">
                          <strong>Warning:</strong> This category has{" "}
                          {productCount} product{productCount !== 1 ? "s" : ""}.
                          You must reassign or delete all products before
                          deleting this category.
                        </p>
                      </div>
                    )}
                    {error && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 px-4 py-3 bg-white/5 text-gray-300 font-semibold rounded-lg hover:bg-white/10 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || productCount > 0}
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
    </>
  );
}
