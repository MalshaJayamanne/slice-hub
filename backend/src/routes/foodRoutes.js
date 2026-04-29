import express from "express";
import {
  createFood,
  getFoods,
  getFoodsByRestaurant,
  getFoodById,
  updateFood,
  deleteFood,
  searchFoods,
} from "../controllers/foodController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("seller", "admin"), createFood);
router.get("/", optionalProtect, getFoods);
router.get("/restaurant/:id", optionalProtect, getFoodsByRestaurant);
router.get("/search", optionalProtect, searchFoods);
router.get("/:id", optionalProtect, getFoodById);
router.put("/:id", protect, authorizeRoles("seller", "admin"), updateFood);
router.delete("/:id", protect, authorizeRoles("seller", "admin"), deleteFood);

export default router;
