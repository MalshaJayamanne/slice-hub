
import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

// Place Order
router.post("/", protect, placeOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);

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
