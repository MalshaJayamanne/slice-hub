import express from "express";
import {
  createFood,
  getFoodsByRestaurant,
  getFoodById,
  updateFood,
  deleteFood,
  searchFoods,
} from "../controllers/foodController.js";

const router = express.Router();

router.post("/", createFood);
router.get("/restaurant/:id", getFoodsByRestaurant);
router.get("/search", searchFoods);
router.get("/:id", getFoodById);
router.put("/:id", updateFood);
router.delete("/:id", deleteFood);

export default router;
