import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import { getOwnerIdString } from "../utils/restaurantAccess.js";
import {
  createHttpError,
  findEnumValue,
  validateObjectId,
} from "../utils/validation.js";

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

const ensureOrderAccess = (order, user) => {
  if (user.role === "admin") {
    return;
  }

  if (user.role === "seller") {
    if (
      getOwnerIdString(
        order.restaurant,
        "Order restaurant is missing ownership details."
      ) !== user._id.toString()
    ) {
      throw createHttpError(
        "Forbidden. You can only access orders for your own restaurant.",
        403
      );
    }

    return;
  }

  if (order.customer._id.toString() !== user._id.toString()) {
    throw createHttpError("Forbidden. You can only access your own orders.", 403);
  }
};

const resolveOrderStatus = (status) => {
  const resolvedStatus = findEnumValue(status, VALID_ORDER_STATUSES);

  if (!resolvedStatus) {
    throw createHttpError("Invalid status.", 400);
  }

  return resolvedStatus;
};

const validateSellerStatusTransition = (currentStatus, nextStatus) => {
  const allowedTransitions = SELLER_STATUS_TRANSITIONS[currentStatus] || [currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    throw createHttpError(
      `Invalid status transition for sellers. Allowed next statuses from ${currentStatus} are: ${allowedTransitions.join(", ")}.`,
      400
    );
  }
};

const normalizeQuantity = (quantity) => Number(quantity);

export const placeOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    if (!restaurantId) {
      throw createHttpError("restaurantId is required.", 400);
    }

    validateObjectId(restaurantId, "restaurant id");

    if (!Array.isArray(items) || items.length === 0) {
      throw createHttpError("Cart is empty.", 400);
    }

    if (!String(deliveryAddress || "").trim()) {
      throw createHttpError("Delivery address is required.", 400);
    }

    const restaurant = await Restaurant.findById(restaurantId).select("ownerId status name");

    if (!restaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    if (restaurant.status !== "approved") {
      throw createHttpError(
        "Orders can only be placed for approved restaurants.",
        400
      );
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item?.foodId) {
        throw createHttpError("Each item must include foodId.", 400);
      }

      validateObjectId(item.foodId, "food id");

      const quantity = normalizeQuantity(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw createHttpError(
          "Each item quantity must be a positive integer.",
          400
        );
      }

      const food = await Food.findById(item.foodId).select("name price restaurant availability");

      if (!food) {
        throw createHttpError("Food not found.", 404);
      }

      if (!food.availability) {
        throw createHttpError(
          `Food item '${food.name}' is currently unavailable.`,
          400
        );
      }

      if (food.restaurant.toString() !== restaurantId) {
        throw createHttpError(
          "All order items must belong to the selected restaurant.",
          400
        );
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
      customer: req.user._id,
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
    const orders = await Order.find({ customer: req.user._id })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getSellerOrders = async (req, res, next) => {
  try {
    const status =
      req.query.status === undefined ? "" : resolveOrderStatus(req.query.status);

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
      throw createHttpError("Order not found.", 404);
    }

    ensureOrderAccess(order, req.user);

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const status = resolveOrderStatus(req.body.status);

    validateObjectId(req.params.id, "order id");

    const order = await populateOrderQuery(Order.findById(req.params.id));

    if (!order) {
      throw createHttpError("Order not found.", 404);
    }

    if (
      req.user.role === "seller" &&
      getOwnerIdString(
        order.restaurant,
        "Order restaurant is missing ownership details."
      ) !== req.user._id.toString()
    ) {
      throw createHttpError(
        "Forbidden. You can only update orders for your own restaurant.",
        403
      );
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
