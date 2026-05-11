
import { Router } from "express";

import {
  googleAuthUser,
  loginUser,
  registerUser,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuthUser);

export default router;
