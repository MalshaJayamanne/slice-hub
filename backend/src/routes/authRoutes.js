
import { Router } from "express";

import {
  googleAuthUser,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuthUser);

router.put("/profile", protect, updateProfile);

export default router;
