import Review from "../models/Review.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

export const createReview = async (req, res) => {
  try {
    const { rating, comment, restaurantId, foodId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const reviewData = {
      user: req.user._id,
      rating,
      comment,
    };

    if (foodId) {
      reviewData.food = foodId;
    } else if (restaurantId) {
      reviewData.restaurant = restaurantId;
    } else {
      return res.status(400).json({ message: "Food or Restaurant ID is required." });
    }

    const review = await Review.create(reviewData);

    // Update average rating for Food or Restaurant
    if (foodId) {
      const food = await Food.findById(foodId);
      if (food) {
        const reviews = await Review.find({ food: foodId });
        food.numReviews = reviews.length;
        food.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await food.save();
      }
    } else if (restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (restaurant) {
        const reviews = await Review.find({ restaurant: restaurantId });
        restaurant.numReviews = reviews.length;
        restaurant.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await restaurant.save();
      }
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this item." });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { restaurantId, foodId } = req.query;
    const filter = {};
    if (restaurantId) filter.restaurant = restaurantId;
    if (foodId) filter.food = foodId;

    const reviews = await Review.find(filter)
      .populate("user", "name profileImage")
      .sort("-createdAt");

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
