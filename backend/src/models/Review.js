import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent user from submitting multiple reviews for the same item/restaurant
reviewSchema.index({ user: 1, food: 1 }, { unique: true, partialFilterExpression: { food: { $exists: true } } });
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true, partialFilterExpression: { restaurant: { $exists: true } } });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
