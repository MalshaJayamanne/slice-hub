import React, { useEffect, useState } from "react";
import { Loader2, MessageSquare, Star, User } from "lucide-react";
import { motion } from "framer-motion";
import reviewAPI from "../api/reviewAPI";
import StarRating from "./StarRating";

const ReviewList = ({ foodId, restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (foodId) params.foodId = foodId;
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await reviewAPI.getReviews(params);
      setReviews(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (err) {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [foodId, restaurantId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <MessageSquare size={24} className="text-slate-300" />
        </div>
        <p className="font-display text-lg font-bold text-slate-900">No reviews yet</p>
        <p className="mt-1 text-sm text-slate-500">Be the first to share your experience with this item!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {reviews.map((review, index) => (
        <motion.div
          key={review._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="surface-panel p-6 shadow-sm border border-slate-100/60"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                {review.user?.profileImage ? (
                  <img src={review.user.profileImage} alt={review.user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{review.user?.name || "Customer"}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={14} className="fill-current" />
              <span className="text-xs font-black">{review.rating}</span>
            </div>
          </div>

          <p className="text-[14px] leading-relaxed text-slate-600 italic">
            "{review.comment}"
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewList;
