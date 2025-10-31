"use client";

import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  productId,
  stock,
  quantity = 1,
}: {
  productId: string;
  stock: number;
  quantity?: number;
}) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock === 0 || quantity < 1) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // Update quantity
      await supabase
        .from("cart")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);
    } else {
      // Insert new item
      await supabase
        .from("cart")
        .insert([{ user_id: user.id, product_id: productId, quantity }]);
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={loading || stock === 0}
      className="p-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-gray-900 hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/40"
      title={stock === 0 ? "Out of stock" : "Add to cart"}
      aria-label="Add to cart"
    >
      <ShoppingCart size={18} />
    </button>
  );
}
