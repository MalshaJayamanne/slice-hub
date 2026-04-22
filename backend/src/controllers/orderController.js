
import Order from "../models/Order.js";
import Food from "../models/Food.js";

export const placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    // 1. Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Address required" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // 2. Validate each item
    for (const item of items) {
      const food = await Food.findById(item.foodId);

      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }

      // 3. Calculate price securely
      const itemTotal = food.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
      });
    }

    // 4. Create order
    const order = new Order({
      customer: req.user.id,
      restaurant: restaurantId,
      items: validatedItems,
      totalAmount,
      deliveryAddress,
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order (tracking)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant", "name")
      .populate("items.food", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only owner can view
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (seller/admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Pending", "Preparing", "Delivered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};