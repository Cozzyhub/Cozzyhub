"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_RECENT_ITEMS = 10;

export function useRecentlyViewed(productId: string) {
  const supabase = createClient();

  useEffect(() => {
    const trackView = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Add to recently_viewed table
      await supabase.from("recently_viewed").upsert(
        {
          user_id: user.id,
          product_id: productId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,product_id",
        },
      );

      // Clean up old entries (keep only last MAX_RECENT_ITEMS)
      const { data: recentViews } = await supabase
        .from("recently_viewed")
        .select("id")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .range(MAX_RECENT_ITEMS, 100);

      if (recentViews && recentViews.length > 0) {
        const idsToDelete = recentViews.map((v) => v.id);
        await supabase.from("recently_viewed").delete().in("id", idsToDelete);
      }

      // Increment product view count
      await supabase.rpc("increment_product_views", {
        product_id: productId,
      });
    };

    trackView();
  }, [productId, supabase]);
}

export async function getRecentlyViewed(userId: string, limit: number = 6) {
  const supabase = createClient();

  const { data } = await supabase
    .from("recently_viewed")
    .select(`
      product:products(
        id,
        name,
        slug,
        price,
        original_price,
        discount_percentage,
        image_url,
        stock,
        is_active
      )
    `)
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  return (
    data
      ?.map((item: any) => item.product)
      .filter((p: any) => p && p.is_active) || []
  );
}
