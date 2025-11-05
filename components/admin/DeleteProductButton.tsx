"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/lib/contexts/ToastContext";

export default function DeleteProductButton({
  productId,
}: {
  productId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This will also delete all associated images.",
      )
    )
      return;

    setLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete product");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
    >
      <Trash2 size={18} />
    </button>
  );
}
