"use client";

import { Trash2, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/utils/currency";

export default function CartItems({ items }: { items: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLoading(itemId);

    await supabase
      .from("cart")
      .update({ quantity: newQuantity })
      .eq("id", itemId);

    setLoading(null);
    router.refresh();
  };

  const removeItem = async (itemId: string) => {
    setLoading(itemId);

    await supabase.from("cart").delete().eq("id", itemId);

    setLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-6">
            {item.products.image_url ? (
              <img
                src={item.products.image_url}
                alt={item.products.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg" />
            )}

            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                {item.products.name}
              </h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {formatINR(item.products.price)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={loading === item.id || item.quantity <= 1}
                  className="text-white hover:text-purple-400 transition disabled:opacity-50"
                >
                  <Minus size={18} />
                </button>
                <span className="text-white font-semibold w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={
                    loading === item.id || item.quantity >= item.products.stock
                  }
                  className="text-white hover:text-purple-400 transition disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={loading === item.id}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
