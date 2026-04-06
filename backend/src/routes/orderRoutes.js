
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "Order routes ready for implementation.",
  });
});

export default router;
