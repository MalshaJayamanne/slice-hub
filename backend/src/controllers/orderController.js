import mongoose from "mongoose";
import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

const VALID_ORDER_STATUSES = ["Pending", "Preparing", "Delivered"];
const SELLER_STATUS_TRANSITIONS = {
  Pending: ["Pending", "Preparing"],
  Preparing: ["Preparing", "Delivered"],
  Delivered: ["Delivered"],
};

const populateOrderQuery = (query) =>
  query
    .populate("customer", "name email")
    .populate({
      path: "restaurant",
      select: "name ownerId status",
    })
    .populate("items.food", "name");

const getRestaurantOwnerId = (restaurant) => {
  const ownerId = restaurant?.ownerId;

  if (!ownerId) {
    const error = new Error("Order restaurant is missing ownership details.");
    error.statusCode = 500;
    throw error;
  }

  return typeof ownerId === "object" && ownerId !== null && "_id" in ownerId
    ? ownerId._id.toString()
    : ownerId.toString();
};

const ensureOrderAccess = (order, user) => {
  if (user.role === "admin") {
    return;
  }

  if (user.role === "seller") {
    if (getRestaurantOwnerId(order.restaurant) !== user._id.toString()) {
      const error = new Error("Forbidden. You can only access orders for your own restaurant.");
      error.statusCode = 403;
      throw error;
    }

    return;
  }

  if (order.customer._id.toString() !== user._id.toString()) {
    const error = new Error("Forbidden. You can only access your own orders.");
    error.statusCode = 403;
    throw error;
  }
};

const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${fieldName}.`);
    error.statusCode = 400;
    throw error;
  }
};

const validateOrderStatus = (status) => {
  if (!VALID_ORDER_STATUSES.includes(status)) {
    const error = new Error("Invalid status.");
    error.statusCode = 400;
    throw error;
  }
};

const validateSellerStatusTransition = (currentStatus, nextStatus) => {
  const allowedTransitions = SELLER_STATUS_TRANSITIONS[currentStatus] || [currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    const error = new Error(
      `Invalid status transition for sellers. Allowed next statuses from ${currentStatus} are: ${allowedTransitions.join(", ")}.`
    );
    error.statusCode = 400;
    throw error;
  }
};

const normalizeQuantity = (quantity) => Number(quantity);

export const placeOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    if (!restaurantId) {
      const error = new Error("restaurantId is required.");
      error.statusCode = 400;
      throw error;
    }

    validateObjectId(restaurantId, "restaurant id");

    if (!items || items.length === 0) {
      const error = new Error("Cart is empty.");
      error.statusCode = 400;
      throw error;
    }

    if (!String(deliveryAddress || "").trim()) {
      const error = new Error("Delivery address is required.");
      error.statusCode = 400;
      throw error;
    }

    const restaurant = await Restaurant.findById(restaurantId).select("ownerId status name");

    if (!restaurant) {
      const error = new Error("Restaurant not found.");
      error.statusCode = 404;
      throw error;
    }

    if (restaurant.status !== "approved") {
      const error = new Error("Orders can only be placed for approved restaurants.");
      error.statusCode = 400;
      throw error;
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item?.foodId) {
        const error = new Error("Each item must include foodId.");
        error.statusCode = 400;
        throw error;
      }

      validateObjectId(item.foodId, "food id");

      const quantity = normalizeQuantity(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        const error = new Error("Each item quantity must be a positive integer.");
        error.statusCode = 400;
        throw error;
      }

      const food = await Food.findById(item.foodId).select("name price restaurant availability");

      if (!food) {
        const error = new Error("Food not found.");
        error.statusCode = 404;
        throw error;
      }

      if (!food.availability) {
        const error = new Error(`Food item '${food.name}' is currently unavailable.`);
        error.statusCode = 400;
        throw error;
      }

      if (food.restaurant.toString() !== restaurantId) {
        const error = new Error("All order items must belong to the selected restaurant.");
        error.statusCode = 400;
        throw error;
      }

      const itemTotal = food.price * quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity,
      });
    }

    const order = new Order({
      customer: req.user.id,
      restaurant: restaurantId,
      items: validatedItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getSellerOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (status !== undefined) {
      validateOrderStatus(status);
    }

    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select("_id");
    const restaurantIds = restaurants.map((restaurant) => restaurant._id);

    if (restaurantIds.length === 0) {
      return res.status(200).json([]);
    }

    const filter = {
      restaurant: { $in: restaurantIds },
    };

    if (status) {
      filter.status = status;
    }

    const orders = await populateOrderQuery(Order.find(filter)).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, "order id");

    const order = await populateOrderQuery(Order.findById(req.params.id));

    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    ensureOrderAccess(order, req.user);

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    validateOrderStatus(status);

    validateObjectId(req.params.id, "order id");

    const order = await populateOrderQuery(Order.findById(req.params.id));

    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    if (
      req.user.role === "seller" &&
      getRestaurantOwnerId(order.restaurant) !== req.user._id.toString()
    ) {
      const error = new Error("Forbidden. You can only update orders for your own restaurant.");
      error.statusCode = 403;
      throw error;
    }

    if (req.user.role === "seller") {
      validateSellerStatusTransition(order.status, status);
    }

    if (order.status === status) {
      return res.status(200).json(order);
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
