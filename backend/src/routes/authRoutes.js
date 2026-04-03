
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "Auth routes ready for register/login implementation.",
  });
});

export default router;
