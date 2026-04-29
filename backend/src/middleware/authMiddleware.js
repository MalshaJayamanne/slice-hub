
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { createHttpError } from "../utils/validation.js";

export const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError("Not authorized. Token is missing.", 401);
    }

    if (!process.env.JWT_SECRET) {
      throw createHttpError("JWT_SECRET is not configured.", 500);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user || !user.isActive) {
      throw createHttpError("Not authorized. User not found or inactive.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Not authorized. Invalid or expired token.";
    }

    next(error);
  }
};

export const optionalProtect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    if (!process.env.JWT_SECRET) {
      throw createHttpError("JWT_SECRET is not configured.", 500);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (_error) {
    next();
  }
};
