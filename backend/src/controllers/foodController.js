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

const ensureFoodAccess = (restaurantOwnerId, user) => {
  if (user.role === "admin") return;

  if (restaurantOwnerId.toString() !== user._id.toString()) {
    const error = new Error("Forbidden. You can only manage food in your own restaurant.");
    error.statusCode = 403;
    throw error;
  }
};

const ensureRestaurantVisibleForFood = (restaurant, user) => {
  if (restaurant.status === "approved") {
    return;
  }

  if (!user) {
    const error = new Error("Restaurant not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "admin") {
    return;
  }

  if (restaurant.ownerId.toString() === user._id.toString()) {
    return;
  }

  const error = new Error("Restaurant not found.");
  error.statusCode = 404;
  throw error;
};

const validateFoodPayload = ({ name, price, category, description, image, availability }, isPartial = false) => {
  if (!isPartial || name !== undefined) {
    if (!String(name || "").trim()) {
      const error = new Error("Food name is required.");
      error.statusCode = 400;
      throw error;
    }
  }

  if (!isPartial || price !== undefined) {
    if (price === "" || price === null || Number.isNaN(Number(price))) {
      const error = new Error("Food price must be a valid number.");
      error.statusCode = 400;
      throw error;
    }

    if (Number(price) < 0) {
      const error = new Error("Food price must be 0 or greater.");
      error.statusCode = 400;
      throw error;
    }
  }

  if (!isPartial || category !== undefined) {
    if (!String(category || "").trim()) {
      const error = new Error("Food category is required.");
      error.statusCode = 400;
      throw error;
    }
  }

  if (description !== undefined && typeof description !== "string") {
    const error = new Error("Food description must be a string.");
    error.statusCode = 400;
    throw error;
  }

  if (image !== undefined && typeof image !== "string") {
    const error = new Error("Food image must be a string.");
    error.statusCode = 400;
    throw error;
  }

  if (availability !== undefined && typeof availability !== "boolean") {
    const error = new Error("Food availability must be true or false.");
    error.statusCode = 400;
    throw error;
  }
};

export const createFood = async (req, res, next) => {
  try {
    const { name, price, category, description, image, availability, restaurant } = req.body;

    if (!restaurant) {
      const error = new Error("Name, price, category, and restaurant are required.");
      error.statusCode = 400;
      throw error;
    }

    validateFoodPayload({ name, price, category, description, image, availability });

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
    ensureFoodAccess(existingRestaurant.ownerId, req.user);

    const food = await Food.create({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      description: description?.trim() || "",
      image: image?.trim() || "",
      availability: availability ?? true,
      restaurant,
    });

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

    const restaurant = await Restaurant.findById(req.params.id).select("ownerId status");

    if (!restaurant) {
      const error = new Error("Restaurant not found.");
      error.statusCode = 404;
      throw error;
    }

    ensureRestaurantVisibleForFood(restaurant, req.user);

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

    ensureRestaurantVisibleForFood(food.restaurant, req.user);

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

    ensureFoodAccess(food.restaurant.ownerId, req.user);

    const { name, price, category, description, image, availability } = req.body;

    validateFoodPayload({ name, price, category, description, image, availability }, true);

    if (name !== undefined) food.name = name.trim();
    if (price !== undefined) food.price = Number(price);
    if (category !== undefined) food.category = category.trim();
    if (description !== undefined) food.description = description.trim();
    if (image !== undefined) food.image = image.trim();
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

    ensureFoodAccess(food.restaurant.ownerId, req.user);

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
    const restaurantId = req.query.restaurantId;

    if (!query || !query.trim()) {
      const error = new Error("Query param 'q' is required.");
      error.statusCode = 400;
      throw error;
    }

    const normalizedQuery = query.trim();
    const filter = {
      $or: [
        { name: { $regex: normalizedQuery, $options: "i" } },
        { category: { $regex: normalizedQuery, $options: "i" } },
      ],
    };

    if (restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        const error = new Error("Invalid restaurant id.");
        error.statusCode = 400;
        throw error;
      }

      const restaurant = await Restaurant.findById(restaurantId).select("ownerId status");

      if (!restaurant) {
        const error = new Error("Restaurant not found.");
        error.statusCode = 404;
        throw error;
      }

      ensureRestaurantVisibleForFood(restaurant, req.user);
      filter.restaurant = restaurantId;
    }

    const foods = await Food.find(filter);

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};
