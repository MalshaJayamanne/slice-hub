import mongoose from "mongoose";

import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

const validateFoodId = (foodId) => {
  if (!mongoose.Types.ObjectId.isValid(foodId)) {
    const error = new Error("Invalid food id.");
    error.statusCode = 400;
    throw error;
  }
};

const ensureFoodAccess = (food, restaurantOwnerId, user) => {
  if (user.role === "admin") return;

  if (restaurantOwnerId.toString() !== user._id.toString()) {
    const error = new Error("Forbidden. You can only manage food in your own restaurant.");
    error.statusCode = 403;
    throw error;
  }
};

export const createFood = async (req, res, next) => {
  try {
    const { name, price, category, image, availability, restaurant } = req.body;

    if (!name || !price || !category || !restaurant) {
      const error = new Error("Name, price, category, and restaurant are required.");
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      const error = new Error("Invalid restaurant id.");
      error.statusCode = 400;
      throw error;
    }

    const existingRestaurant = await Restaurant.findById(restaurant);

    if (!existingRestaurant) {
      const error = new Error("Restaurant not found.");
      error.statusCode = 404;
      throw error;
    }

    // Sellers can only add food to their own restaurant
    ensureFoodAccess(null, existingRestaurant.ownerId, req.user);

    const food = await Food.create({ name, price, category, image, availability, restaurant });

    res.status(201).json({
      success: true,
      message: "Food created successfully.",
      food,
    });
  } catch (error) {
    next(error);
  }
};

export const getFoodsByRestaurant = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const error = new Error("Invalid restaurant id.");
      error.statusCode = 400;
      throw error;
    }

    const foods = await Food.find({ restaurant: req.params.id });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};

export const getFoodById = async (req, res, next) => {
  try {
    validateFoodId(req.params.id);

    const food = await Food.findById(req.params.id).populate("restaurant");

    if (!food) {
      const error = new Error("Food not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFood = async (req, res, next) => {
  try {
    validateFoodId(req.params.id);

    const food = await Food.findById(req.params.id).populate("restaurant");

    if (!food) {
      const error = new Error("Food not found.");
      error.statusCode = 404;
      throw error;
    }

    ensureFoodAccess(food, food.restaurant.ownerId, req.user);

    const { name, price, category, image, availability } = req.body;

    if (name !== undefined) food.name = name;
    if (price !== undefined) food.price = price;
    if (category !== undefined) food.category = category;
    if (image !== undefined) food.image = image;
    if (availability !== undefined) food.availability = availability;

    const updatedFood = await food.save();

    res.status(200).json({
      success: true,
      message: "Food updated successfully.",
      food: updatedFood,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFood = async (req, res, next) => {
  try {
    validateFoodId(req.params.id);

    const food = await Food.findById(req.params.id).populate("restaurant");

    if (!food) {
      const error = new Error("Food not found.");
      error.statusCode = 404;
      throw error;
    }

    ensureFoodAccess(food, food.restaurant.ownerId, req.user);

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: "Food deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const searchFoods = async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query || !query.trim()) {
      const error = new Error("Query param 'q' is required.");
      error.statusCode = 400;
      throw error;
    }

    const foods = await Food.find({
      name: { $regex: query.trim(), $options: "i" },
    });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};