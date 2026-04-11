import { Router } from "express";

import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getRestaurants,
  updateRestaurant,
  updateRestaurantStatus,
} from "../controllers/restaurantController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router
  .route("/")
  .get(optionalProtect, getRestaurants)
  .post(protect, authorizeRoles("seller", "admin"), createRestaurant);

router
  .route("/:id")
  .get(optionalProtect, getRestaurantById)
  .put(protect, authorizeRoles("seller", "admin"), updateRestaurant)
  .delete(protect, authorizeRoles("seller", "admin"), deleteRestaurant);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateRestaurantStatus
);

export default router;
