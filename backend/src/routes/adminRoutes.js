
import { Router } from "express";
import {
  getAdminRestaurants,
  getAdminUsers,
  getDashboardSummary,
  getPlatformOrders,
  updateAdminRestaurantStatus,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));

router.get("/dashboard-summary", getDashboardSummary);
router.get("/users", getAdminUsers);
router.get("/restaurants", getAdminRestaurants);
router.patch("/restaurants/:id/status", updateAdminRestaurantStatus);
router.get("/orders", getPlatformOrders);

export default router;
