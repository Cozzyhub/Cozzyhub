"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle } from "lucide-react";
import { useToast } from "@/lib/contexts/ToastContext";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  profiles: { full_name: string };
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchReviews();
    checkUser();
  }, [productId]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      setShowForm(false);
      setFormData({ rating: 5, title: "", comment: "" });
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    size = 20,
  }: {
    rating: number;
    size?: number;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="mt-12 border-t border-gray-200 pt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
          Customer Reviews
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold text-gray-900">
            {averageRating}
          </div>
          <div>
            <StarRating rating={Number.parseFloat(averageRating)} size={24} />
            <p className="text-gray-600 mt-1">
              Based on {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      {user && (
        <div className="mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 btn-primary rounded-lg"
            >
              Write a Review
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-card p-6 rounded-xl space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      <Star
                        size={32}
                        className={
                          star <= formData.rating
                            ? "fill-amber-400 text-amber-400 cursor-pointer"
                            : "text-gray-300 cursor-pointer hover:text-amber-200"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Sum up your experience"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Share your thoughts about this product"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 btn-primary rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 btn-ghost rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-600">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="glass-card p-6 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={review.rating} />
                    {review.verified_purchase && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        <span>Verified Purchase</span>
                      </div>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900">
                      {review.title}
                    </h4>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{review.profiles?.full_name || "Anonymous"}</p>
                  <p>{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
}
