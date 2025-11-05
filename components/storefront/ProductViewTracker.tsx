"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";

export default function ProductViewTracker({
  productId,
}: {
  productId: string;
}) {
  useRecentlyViewed(productId);
  return null;
}
