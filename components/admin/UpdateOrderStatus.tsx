"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    setStatus(newStatus);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Error updating status");
      setStatus(currentStatus);
    } else {
      router.refresh();
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
