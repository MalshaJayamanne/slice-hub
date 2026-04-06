import mongoose from "mongoose";

import Restaurant from "../models/Restaurant.js";

const validateRestaurantId = (restaurantId) => {
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    const error = new Error("Invalid restaurant id.");
    error.statusCode = 400;
    throw error;
  }
};

const ensureRestaurantAccess = (restaurant, user) => {
  if (user.role === "admin") {
    return;
  }

  if (restaurant.ownerId.toString() !== user._id.toString()) {
    const error = new Error("Forbidden. You can only manage your own restaurants.");
    error.statusCode = 403;
    throw error;
  }
};

const ensureApprovedOrAuthorized = (restaurant, user) => {
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

  const ownerId =
    typeof restaurant.ownerId === "object" && restaurant.ownerId !== null && "_id" in restaurant.ownerId
      ? restaurant.ownerId._id.toString()
      : restaurant.ownerId.toString();

  if (ownerId === user._id.toString()) {
    return;
  }

  const error = new Error("Restaurant not found.");
  error.statusCode = 404;
  throw error;
};

export const createRestaurant = async (req, res, next) => {
  try {
    const { name, ownerId, description, category, image, status } = req.body;

    if (!name || !category) {
      const error = new Error("Name and category are required.");
      error.statusCode = 400;
      throw error;
    }

    const restaurantOwnerId = req.user.role === "admin" && ownerId ? ownerId : req.user._id;

    if (!mongoose.Types.ObjectId.isValid(restaurantOwnerId)) {
      const error = new Error("A valid ownerId is required.");
      error.statusCode = 400;
      throw error;
    }

    const restaurant = await Restaurant.create({
      name,
      ownerId: restaurantOwnerId,
      description,
      category,
      image,
      status: req.user.role === "admin" && status ? status : "pending",
    });

    const populatedRestaurant = await Restaurant.findById(restaurant._id).populate(
      "ownerId",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully.",
      restaurant: populatedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurants = async (req, res, next) => {
  try {
    const filter = {};
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();
    const cuisine = req.query.cuisine?.trim();

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category || cuisine) {
      filter.category = {
        $regex: category || cuisine,
        $options: "i",
      };
    }

    if (!req.user || req.user.role === "customer") {
      filter.status = "approved";
    }

    const restaurants = await Restaurant.find(filter)
      .populate("ownerId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      search: search || "",
      category: category || "",
      cuisine: cuisine || "",
      status: filter.status || "all",
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    validateRestaurantId(req.params.id);

    const restaurant = await Restaurant.findById(req.params.id).populate(
      "ownerId",
      "name email role"
    );

    if (!restaurant) {
      const error = new Error("Restaurant not found.");
      error.statusCode = 404;
      throw error;
    }

    ensureApprovedOrAuthorized(restaurant, req.user);

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    validateRestaurantId(req.params.id);

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      const error = new Error("Restaurant not found.");
      error.statusCode = 404;
      throw error;
    }

    ensureRestaurantAccess(restaurant, req.user);

    const { name, ownerId, description, category, image, status } = req.body;

    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (category !== undefined) restaurant.category = category;
    if (image !== undefined) restaurant.image = image;

    if (req.user.role === "admin" && ownerId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        const error = new Error("Invalid ownerId.");
        error.statusCode = 400;
        throw error;
      }

      restaurant.ownerId = ownerId;
    }

    if (req.user.role === "admin" && status !== undefined) {
      restaurant.status = status;
    } else if (req.user.role === "seller" && status !== undefined) {
      const error = new Error("Forbidden. Only admins can change restaurant approval status.");
      error.statusCode = 403;
      throw error;
    }

    const updatedRestaurant = await restaurant.save();
    await updatedRestaurant.populate("ownerId", "name email role");

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully.",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    validateRestaurantId(req.params.id);

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      const error = new Error("Restaurant not found.");
      error.statusCode = 404;
      throw error;
    }

    ensureRestaurantAccess(restaurant, req.user);

    await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantStatus = async (req, res, next) => {
  try {
    validateRestaurantId(req.params.id);

    const { status } = req.body;
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!status) {
      const error = new Error("Status is required.");
      error.statusCode = 400;
      throw error;
    }

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Status must be pending, approved, or rejected.");
      error.statusCode = 400;
      throw error;
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      const error = new Error("Restaurant not found.");
      error.statusCode = 404;
      throw error;
    }

    restaurant.status = status;

    const updatedRestaurant = await restaurant.save();
    await updatedRestaurant.populate("ownerId", "name email role");

    res.status(200).json({
      success: true,
      message: `Restaurant ${status} successfully.`,
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};
