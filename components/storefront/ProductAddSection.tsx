"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AddToCartButton from "@/components/storefront/AddToCartButton";

export default function ProductAddSection({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(stock, q + 1));

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=/checkout`);
        return;
      }

      // Add to cart first
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
          .update({ quantity: existingItem.quantity + qty })
          .eq("id", existingItem.id);
      } else {
        // Insert new item
        await supabase
          .from("cart")
          .insert({ user_id: user.id, product_id: productId, quantity: qty });
      }

      // Redirect to checkout
      router.push("/checkout");
    } catch (error) {
      console.error("Buy now error:", error);
      alert("Failed to proceed to checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Quantity Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Quantity</label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={dec}
              disabled={qty <= 1}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xl"
            >
              −
            </button>
            <span className="w-16 text-center text-gray-900 font-semibold text-lg border-x border-gray-300 py-2">{qty}</span>
            <button
              type="button"
              onClick={inc}
              disabled={qty >= stock}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xl"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBuyNow}
          disabled={loading || stock === 0}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Buy Now</span>
            </>
          )}
        </button>
        <div className="flex-1">
          <AddToCartButton productId={productId} stock={stock} quantity={qty} />
        </div>
      </div>
    </div>
  );
}
