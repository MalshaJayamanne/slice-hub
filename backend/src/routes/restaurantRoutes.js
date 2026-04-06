
import { Router } from "express";

import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getRestaurants,
  updateRestaurant,
} from "../controllers/restaurantController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router
  .route("/")
  .get(getRestaurants)
  .post(protect, authorizeRoles("seller", "admin"), createRestaurant);

router
  .route("/:id")
  .get(getRestaurantById)
  .put(protect, authorizeRoles("seller", "admin"), updateRestaurant)
  .delete(protect, authorizeRoles("seller", "admin"), deleteRestaurant);

export default router;
