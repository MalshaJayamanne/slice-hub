import { Readable } from "stream";

import cloudinary, { configureCloudinary } from "../config/cloudinary.js";
import { createHttpError, findEnumValue } from "../utils/validation.js";

const IMAGE_TYPES = ["food", "restaurant", "profile", "review", "verification", "category"];

const folderByType = {
  food: "slice-hub/foods",
  restaurant: "slice-hub/restaurants",
  profile: "slice-hub/profiles",
  review: "slice-hub/reviews",
  verification: "slice-hub/restaurant-verifications",
  category: "slice-hub/categories",
};

const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1600, height: 1200, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createHttpError("Image file is required.", 400);
    }

    const imageType = findEnumValue(req.body.type, IMAGE_TYPES) || "food";

    if (!configureCloudinary()) {
      throw createHttpError(
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        500
      );
    }

    const result = await uploadBufferToCloudinary(req.file, folderByType[imageType]);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        type: imageType,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    next(error);
  }
};
