
import { Router } from "express";

import {
  googleAuthUser,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuthUser);

router.put("/profile", protect, authorizeRoles("customer"), updateProfile);

export default router;
