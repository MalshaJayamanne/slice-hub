import { Router } from "express";
import rateLimit from "express-rate-limit";

import { chatWithAI } from "../controllers/aiController.js";
import { optionalProtect } from "../middleware/authMiddleware.js";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many assistant messages. Please wait a moment and try again.",
  },
});

router.post("/chat", aiLimiter, optionalProtect, chatWithAI);

export default router;
