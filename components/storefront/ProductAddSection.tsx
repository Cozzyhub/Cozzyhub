"use client";

import { useState } from "react";
import AddToCartButton from "@/components/storefront/AddToCartButton";

export default function ProductAddSection({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [qty, setQty] = useState(1);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(stock, q + 1));

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
        <button
          type="button"
          onClick={dec}
          disabled={qty <= 1}
          className="px-3 py-1 text-white hover:text-purple-400 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-10 text-center text-white font-semibold">{qty}</span>
        <button
          type="button"
          onClick={inc}
          disabled={qty >= stock}
          className="px-3 py-1 text-white hover:text-purple-400 disabled:opacity-50"
        >
          +
        </button>
      </div>

      <AddToCartButton productId={productId} stock={stock} quantity={qty} />
    </div>
  );
}
