import React, { useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";
import reviewAPI from "../api/reviewAPI";

const ReviewModal = ({ isOpen, onClose, target, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !target) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short comment.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        rating,
        comment: comment.trim(),
        foodId: target.type === "food" ? target.id : undefined,
        restaurantId: target.type === "restaurant" ? target.id : undefined,
      };

      await reviewAPI.createReview(payload);
      onSuccess && onSuccess();
      onClose();
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Rate {target.name}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-slate-100"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-8 flex flex-col items-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                How was your meal?
              </p>
              <StarRating rating={rating} onRate={setRating} size={40} />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                Your Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you liked or what could be better..."
                className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm transition-all focus:border-primary/20 focus:ring-0 min-h-[120px]"
              />
            </div>

            {error && (
              <p className="mb-6 text-center text-sm font-bold text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base shadow-xl shadow-primary/20"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
