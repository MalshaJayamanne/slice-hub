import { Router } from "express";

import { uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleUploadErrors, imageUpload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post(
  "/image",
  protect,
  imageUpload.single("image"),
  handleUploadErrors,
  uploadImage
);

export default router;
