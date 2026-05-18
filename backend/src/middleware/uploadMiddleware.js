import multer from "multer";

import { createHttpError } from "../utils/validation.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      callback(createHttpError("Only JPG, PNG, WEBP, or GIF images are allowed.", 400));
      return;
    }

    callback(null, true);
  },
});

export const handleUploadErrors = (err, _req, _res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5MB or smaller."
        : "Image upload failed.";
    next(createHttpError(message, 400));
    return;
  }

  next(err);
};
