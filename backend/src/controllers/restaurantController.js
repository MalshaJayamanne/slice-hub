import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import {
  buildRestaurantVisibilityFilter,
  ensureOwnerAccess,
  ensureRestaurantVisible,
} from "../utils/restaurantAccess.js";
import {
  createHttpError,
  findEnumValue,
  normalizeStringValue,
  validateObjectId,
} from "../utils/validation.js";

const RESTAURANT_STATUSES = ["pending", "approved", "rejected"];

const validateRestaurantPayload = (
  { name, category, description, image },
  isPartial = false
) => {
  if (!isPartial || name !== undefined) {
    if (!normalizeStringValue(name)) {
      throw createHttpError("Name is required.", 400);
    }
  }

  if (!isPartial || category !== undefined) {
    if (!normalizeStringValue(category)) {
      throw createHttpError("Category is required.", 400);
    }
  }

  if (description !== undefined && typeof description !== "string") {
    throw createHttpError("Description must be a string.", 400);
  }

  if (image !== undefined && typeof image !== "string") {
    throw createHttpError("Image must be a string.", 400);
  }
};

const resolveRestaurantOwnerId = async (user, requestedOwnerId) => {
  const ownerId = user.role === "admin" && requestedOwnerId !== undefined ? requestedOwnerId : user._id;

  validateObjectId(ownerId, "owner id");

  const owner = await User.findById(ownerId).select("role");

  if (!owner) {
    throw createHttpError("Restaurant owner not found.", 404);
  }

  if (!["seller", "admin"].includes(owner.role)) {
    throw createHttpError("Restaurant owner must be a seller or admin.", 400);
  }

  return owner._id;
};

export const createRestaurant = async (req, res, next) => {
  try {
    const { name, ownerId, description, category, image, status } = req.body;
    validateRestaurantPayload({ name, category, description, image });

    const restaurantOwnerId = await resolveRestaurantOwnerId(req.user, ownerId);
    const restaurantStatus =
      req.user.role === "admin" && status !== undefined
        ? findEnumValue(status, RESTAURANT_STATUSES)
        : "pending";

    if (!restaurantStatus) {
      throw createHttpError("Invalid restaurant status.", 400);
    }

    const restaurant = await Restaurant.create({
      name: normalizeStringValue(name),
      ownerId: restaurantOwnerId,
      description: description?.trim() || "",
      category: normalizeStringValue(category),
      image: image?.trim() || "",
      status: restaurantStatus,
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
    const search = normalizeStringValue(req.query.search);
    const category = normalizeStringValue(req.query.category);
    const cuisine = normalizeStringValue(req.query.cuisine);
    const filters = [];

    if (search) {
      filters.push({
        name: {
          $regex: search,
          $options: "i",
        },
      });
    }

    if (category || cuisine) {
      filters.push({
        category: {
          $regex: category || cuisine,
          $options: "i",
        },
      });
    }

    filters.push(buildRestaurantVisibilityFilter(req.user));

    const filter =
      filters.length === 0 ? {} : filters.length === 1 ? filters[0] : { $and: filters };

    const restaurants = await Restaurant.find(filter)
      .populate("ownerId", "name email role")
      .sort({ createdAt: -1 });

    const statusScope =
      !req.user || req.user.role === "customer"
        ? "approved"
        : req.user.role === "seller"
        ? "seller-visible"
        : "all";

    res.status(200).json({
      success: true,
      count: restaurants.length,
      search: search || "",
      category: category || "",
      cuisine: cuisine || "",
      status: statusScope,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, "restaurant id");

    const restaurant = await Restaurant.findById(req.params.id).populate(
      "ownerId",
      "name email role"
    );

    if (!restaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    ensureRestaurantVisible(restaurant, req.user);

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
    validateObjectId(req.params.id, "restaurant id");

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    ensureOwnerAccess(
      restaurant,
      req.user,
      "Forbidden. You can only manage your own restaurants."
    );

    const { name, ownerId, description, category, image, status } = req.body;
    validateRestaurantPayload({ name, category, description, image }, true);

    if (name !== undefined) restaurant.name = normalizeStringValue(name);
    if (description !== undefined) restaurant.description = description.trim();
    if (category !== undefined) restaurant.category = normalizeStringValue(category);
    if (image !== undefined) restaurant.image = image.trim();

    if (req.user.role === "admin" && ownerId !== undefined) {
      restaurant.ownerId = await resolveRestaurantOwnerId(req.user, ownerId);
    }

    if (req.user.role === "admin" && status !== undefined) {
      const normalizedStatus = findEnumValue(status, RESTAURANT_STATUSES);

      if (!normalizedStatus) {
        throw createHttpError("Invalid restaurant status.", 400);
      }

      restaurant.status = normalizedStatus;
    } else if (req.user.role === "seller" && status !== undefined) {
      throw createHttpError(
        "Forbidden. Only admins can change restaurant approval status.",
        403
      );
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
    validateObjectId(req.params.id, "restaurant id");

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    ensureOwnerAccess(
      restaurant,
      req.user,
      "Forbidden. You can only manage your own restaurants."
    );

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
    validateObjectId(req.params.id, "restaurant id");

    const normalizedStatus = findEnumValue(req.body.status, RESTAURANT_STATUSES);

    if (!normalizedStatus) {
      throw createHttpError("Status must be pending, approved, or rejected.", 400);
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    restaurant.status = normalizedStatus;

    const updatedRestaurant = await restaurant.save();
    await updatedRestaurant.populate("ownerId", "name email role");

    res.status(200).json({
      success: true,
      message: `Restaurant ${normalizedStatus} successfully.`,
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};
