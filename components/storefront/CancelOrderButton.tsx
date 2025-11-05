"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "@/lib/contexts/ToastContext";
import { useRouter } from "next/navigation";

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Order cancelled successfully");
        router.refresh();
        setShowConfirm(false);
      } else {
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition font-semibold text-sm flex items-center gap-2"
      >
        <X size={16} />
        Cancel Order
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-gray-700 text-sm mr-2">Are you sure?</p>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold text-sm disabled:opacity-50"
      >
        {loading ? "Cancelling..." : "Yes, Cancel"}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={loading}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-semibold text-sm"
      >
        No
      </button>
    </div>
  );
}
