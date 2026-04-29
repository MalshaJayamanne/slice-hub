
import { Router } from "express";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminRestaurants,
  getAdminUsers,
  getDashboardSummary,
  getPlatformOrders,
  updateAdminUser,
  updateAdminRestaurantStatus,
} from "../controllers/adminController.js";
import {
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
} from "../controllers/restaurantController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));

router.get("/dashboard-summary", getDashboardSummary);

router
  .route("/users")
  .get(getAdminUsers)
  .post(createAdminUser);

router
  .route("/users/:id")
  .put(updateAdminUser)
  .delete(deleteAdminUser);

router
  .route("/restaurants")
  .get(getAdminRestaurants)
  .post(createRestaurant);

router
  .route("/restaurants/:id")
  .put(updateRestaurant)
  .delete(deleteRestaurant);

router.patch("/restaurants/:id/status", updateAdminRestaurantStatus);
router.get("/orders", getPlatformOrders);

export default router;
