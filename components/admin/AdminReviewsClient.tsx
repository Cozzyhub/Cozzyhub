"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  verified_purchase: boolean;
  helpful_count: number;
  products: {
    name: string;
    slug: string;
    image_url: string;
  };
}

interface AdminReviewsClientProps {
  initialReviews: Review[];
}

export default function AdminReviewsClient({ initialReviews }: AdminReviewsClientProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [loading, setLoading] = useState(false);

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews || 0;
  const verifiedReviews = reviews.filter((r) => r.verified_purchase).length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100 || 0,
  }));

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.products.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === "all" || review.rating === filterRating;

    return matchesSearch && matchesRating;
  });

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        router.refresh();
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      alert("Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reviews Management</h1>
        <p className="text-gray-400">Moderate and analyze customer reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-purple-400" size={24} />
            <span className="text-gray-400">Total Reviews</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalReviews}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-400" size={24} />
            <span className="text-gray-400">Average Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-white">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= averageRating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                  }
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <span className="text-gray-400">Verified Purchases</span>
          </div>
          <p className="text-3xl font-bold text-white">{verifiedReviews}</p>
          <p className="text-sm text-gray-400 mt-1">
            {((verifiedReviews / totalReviews) * 100 || 0).toFixed(1)}% verified
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-400" size={24} />
            <span className="text-gray-400">Avg. Helpful Votes</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(reviews.reduce((sum, r) => sum + r.helpful_count, 0) / totalReviews || 0).toFixed(1)}
          </p>
        </motion.div>
      </div>

      {/* Rating Distribution */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-white font-medium w-8">{rating}★</span>
              <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: rating * 0.1 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                />
              </div>
              <span className="text-gray-400 w-16 text-right">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-purple-400" />
          <h3 className="text-white font-semibold">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search reviews, products, or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">
            {filteredReviews.length} Review(s)
          </h3>
        </div>

        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <img
                src={review.products.image_url}
                alt={review.products.name}
                className="w-16 h-16 object-cover rounded-lg"
              />

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link
                      href={`/products/${review.products.slug}`}
                      className="text-white font-semibold hover:text-pink-400 transition"
                    >
                      {review.products.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }
                          />
                        ))}
                      </div>
                      {review.verified_purchase && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={loading}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {review.title && (
                  <h4 className="text-white font-medium mb-1">{review.title}</h4>
                )}
                <p className="text-gray-300 text-sm mb-3">{review.comment}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {review.helpful_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{review.helpful_count} found helpful</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}
