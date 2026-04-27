
import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

// Place Order
router.post("/", protect, authorizeRoles("customer"), placeOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, authorizeRoles("customer"), getMyOrders);

// Get seller orders for restaurants owned by the logged-in seller
router.get("/seller", protect, authorizeRoles("seller"), getSellerOrders);

// Get single order tracking details
router.get("/:id/tracking", protect, getOrderById);

// Get single order (tracking)
router.get("/:id", protect, getOrderById);

// Update order status (seller/admin only)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("seller", "admin"),
  updateOrderStatus
);

export default router;
