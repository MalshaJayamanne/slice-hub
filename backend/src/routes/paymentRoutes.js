import { Router } from "express";

import {
  createPayment,
  getPaymentHistory,
  getPaymentById,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post(
  "/process",
  protect,
  authorizeRoles("customer"),
  createPayment
);

router.get(
  "/history",
  protect,
  authorizeRoles("customer"),
  getPaymentHistory
);

router.get(
  "/:id",
  protect,
  authorizeRoles("customer"),
  getPaymentById
);

export default router;