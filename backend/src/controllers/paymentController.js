import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

import {
  createHttpError,
  validateObjectId,
} from "../utils/validation.js";

const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
};

const processMockPayment = (paymentMethod, cardNumber) => {
  if (paymentMethod === "cash") {
    return {
      success: true,
      status: "pending",
    };
  }

  if (paymentMethod === "paypal") {
    return {
      success: true,
      status: "paid",
    };
  }

  const cleanedCard = cardNumber?.replace(/\s/g, "");

  if (cleanedCard === "4242424242424242") {
    return {
      success: true,
      status: "paid",
    };
  }

  const randomSuccess = Math.random() < 0.8;

  return {
    success: randomSuccess,
    status: randomSuccess ? "paid" : "failed",
  };
};

export const createPayment = async (req, res, next) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      amount,
      cardNumber,
    } = req.body;

    if (!restaurantId) {
      throw createHttpError("restaurantId is required.");
    }

    validateObjectId(restaurantId, "restaurant id");

    if (!Array.isArray(items) || items.length === 0) {
      throw createHttpError("Cart is empty.");
    }

    if (!deliveryAddress?.trim()) {
      throw createHttpError(
        "Delivery address is required."
      );
    }

    const restaurant = await Restaurant.findById(
      restaurantId
    );

    if (!restaurant) {
      throw createHttpError(
        "Restaurant not found.",
        404
      );
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      validateObjectId(item.foodId, "food id");

      const food = await Food.findById(item.foodId);

      if (!food) {
        throw createHttpError("Food not found.", 404);
      }

      const quantity = Number(item.quantity);

      const itemTotal = food.price * quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity,
      });
    }

    if (Number(amount) !== totalAmount) {
      throw createHttpError(
        "Invalid payment amount."
      );
    }

    const paymentResult = processMockPayment(
      paymentMethod,
      cardNumber
    );

    const transactionId = generateTransactionId();

    const payment = await Payment.create({
      customer: req.user._id,
      paymentMethod,
      amount,
      paymentStatus: paymentResult.status,
      transactionId,
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: "Payment failed.",
        payment,
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: validatedItems,
      totalAmount,
      deliveryAddress,
    });

    payment.order = order._id;
    await payment.save();

    return res.status(201).json({
      success: true,
      message: "Payment successful.",
      payment,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (
  req,
  res,
  next
) => {
  try {
    const payments = await Payment.find({
      customer: req.user._id,
    })
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (
  req,
  res,
  next
) => {
  try {
    validateObjectId(req.params.id, "payment id");

    const payment = await Payment.findById(
      req.params.id
    ).populate("order");

    if (!payment) {
      throw createHttpError(
        "Payment not found.",
        404
      );
    }

    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
};