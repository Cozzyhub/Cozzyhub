"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/lib/contexts/ToastContext";
import { createClient } from "@/lib/supabase/client";

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      checkWishlist();
    }
  }, [productId, isAuthenticated]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const checkWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();

      if (res.ok && data.wishlist) {
        const inWishlist = data.wishlist.some(
          (item: any) => item.product.id === productId,
        );
        setIsInWishlist(inWishlist);
      }
    } catch (error) {
      console.error("Failed to check wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist?product_id=${productId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setIsInWishlist(false);
          toast.success("Removed from wishlist");
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId }),
        });

        const data = await res.json();

        if (res.ok) {
          setIsInWishlist(true);
          toast.success("Added to wishlist");
        } else if (res.status === 409) {
          setIsInWishlist(true);
          toast.info("Already in wishlist");
        } else {
          toast.error(data.error || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-3 rounded-full transition-all ${
        isInWishlist
          ? "bg-pink-500 text-white"
          : "bg-white/10 text-white hover:bg-pink-500/20"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={20} className={isInWishlist ? "fill-current" : ""} />
    </button>
  );
}
