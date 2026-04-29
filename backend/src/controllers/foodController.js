import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import {
  buildRestaurantVisibilityFilter,
  ensureOwnerAccess,
  ensureRestaurantVisible,
} from "../utils/restaurantAccess.js";
import {
  createHttpError,
  normalizeStringValue,
  validateObjectId,
} from "../utils/validation.js";

const validateFoodPayload = ({ name, price, category, description, image, availability }, isPartial = false) => {
  if (!isPartial || name !== undefined) {
    if (!String(name || "").trim()) {
      throw createHttpError("Food name is required.", 400);
    }
  }

  if (!isPartial || price !== undefined) {
    if (price === "" || price === null || Number.isNaN(Number(price))) {
      throw createHttpError("Food price must be a valid number.", 400);
    }

    if (Number(price) < 0) {
      throw createHttpError("Food price must be 0 or greater.", 400);
    }
  }

  if (!isPartial || category !== undefined) {
    if (!String(category || "").trim()) {
      throw createHttpError("Food category is required.", 400);
    }
  }

  if (description !== undefined && typeof description !== "string") {
    throw createHttpError("Food description must be a string.", 400);
  }

  if (image !== undefined && typeof image !== "string") {
    throw createHttpError("Food image must be a string.", 400);
  }

  if (availability !== undefined && typeof availability !== "boolean") {
    throw createHttpError("Food availability must be true or false.", 400);
  }
};

export const createFood = async (req, res, next) => {
  try {
    const { name, price, category, description, image, availability, restaurant } = req.body;

    if (!restaurant) {
      throw createHttpError("Name, price, category, and restaurant are required.", 400);
    }

    validateFoodPayload({ name, price, category, description, image, availability });
    validateObjectId(restaurant, "restaurant id");

    const existingRestaurant = await Restaurant.findById(restaurant);

    if (!existingRestaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    ensureOwnerAccess(
      existingRestaurant.ownerId,
      req.user,
      "Forbidden. You can only manage food in your own restaurant."
    );

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

export const getFoods = async (req, res, next) => {
  try {
    const visibleRestaurants = await Restaurant.find(
      buildRestaurantVisibilityFilter(req.user)
    ).select("_id");

    if (visibleRestaurants.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        foods: [],
      });
    }

    const filter = {
      restaurant: {
        $in: visibleRestaurants.map((restaurant) => restaurant._id),
      },
    };

    // Keep the public home feed focused on dishes customers can actually order.
    if (!req.user || req.user.role === "customer") {
      filter.availability = true;
    }

    const foods = await Food.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};

export const getFoodsByRestaurant = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, "restaurant id");

    const restaurant = await Restaurant.findById(req.params.id).select("ownerId status");

    if (!restaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    ensureRestaurantVisible(restaurant, req.user);

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
    validateObjectId(req.params.id, "food id");

    const food = await Food.findById(req.params.id).populate("restaurant");

    if (!food) {
      throw createHttpError("Food not found.", 404);
    }

    ensureRestaurantVisible(food.restaurant, req.user);

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
    validateObjectId(req.params.id, "food id");

    const food = await Food.findById(req.params.id).populate("restaurant");

    if (!food) {
      throw createHttpError("Food not found.", 404);
    }

    ensureOwnerAccess(
      food.restaurant.ownerId,
      req.user,
      "Forbidden. You can only manage food in your own restaurant."
    );

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
    validateObjectId(req.params.id, "food id");

    const food = await Food.findById(req.params.id).populate("restaurant");

    if (!food) {
      throw createHttpError("Food not found.", 404);
    }

    ensureOwnerAccess(
      food.restaurant.ownerId,
      req.user,
      "Forbidden. You can only manage food in your own restaurant."
    );

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
    const query = normalizeStringValue(req.query.q);
    const restaurantId = normalizeStringValue(req.query.restaurantId);

    if (!query) {
      throw createHttpError("Query param 'q' is required.", 400);
    }

    const filter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    if (restaurantId) {
      validateObjectId(restaurantId, "restaurant id");

      const restaurant = await Restaurant.findById(restaurantId).select("ownerId status");

      if (!restaurant) {
        throw createHttpError("Restaurant not found.", 404);
      }

      ensureRestaurantVisible(restaurant, req.user);
      filter.restaurant = restaurantId;
    } else {
      const visibleRestaurants = await Restaurant.find(
        buildRestaurantVisibilityFilter(req.user)
      ).select("_id");

      if (visibleRestaurants.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          foods: [],
        });
      }

      filter.restaurant = {
        $in: visibleRestaurants.map((restaurant) => restaurant._id),
      };
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
