
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Not authorized. Token is missing.");
      error.statusCode = 401;
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured.");
      error.statusCode = 500;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user || !user.isActive) {
      const error = new Error("Not authorized. User not found or inactive.");
      error.statusCode = 401;
      throw error;
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
