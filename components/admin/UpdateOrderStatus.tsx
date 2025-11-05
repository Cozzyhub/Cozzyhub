"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/contexts/ToastContext";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    setStatus(newStatus);

    try {
      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Trigger email notification via API
      if (newStatus === "shipped" || newStatus === "delivered") {
        try {
          await fetch("/api/orders/send-status-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, status: newStatus }),
          });
          // Email sent in background, don't block UI
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          // Don't show error to user, email is optional
        }
      }

      toast.success(`Order status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
      setStatus(currentStatus);
    }

    setLoading(false);
  };

  return (
    <select
      value={status}
      onChange={(e) => handleUpdate(e.target.value)}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s} className="bg-slate-900">
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
