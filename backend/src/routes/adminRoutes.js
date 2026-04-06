
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "Admin routes ready for implementation.",
  });
});

export default router;
