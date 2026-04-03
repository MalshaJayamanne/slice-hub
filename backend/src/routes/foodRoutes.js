
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "Food routes ready for implementation.",
  });
});

export default router;
