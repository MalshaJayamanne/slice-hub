
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { createHttpError, normalizeStringValue } from "../utils/validation.js";

const createToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  profileImage: user.profileImage,
  isActive: user.isActive,
  token: createToken(user._id.toString(), user.role),
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, profileImage } = req.body;
    const normalizedName = normalizeStringValue(name);
    const normalizedEmail = normalizeStringValue(email).toLowerCase();
    const normalizedRole =
      typeof role === "string" ? role.trim().toLowerCase() : "customer";
    const allowedPublicRoles = ["customer", "seller"];

    if (
      !normalizedName ||
      !normalizedEmail ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      throw createHttpError("Name, email, and password are required.", 400);
    }

    if (!process.env.JWT_SECRET) {
      throw createHttpError("JWT_SECRET is not configured.", 500);
    }

    if (!allowedPublicRoles.includes(normalizedRole)) {
      throw createHttpError("Role must be either customer or seller.", 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw createHttpError("User already exists with this email.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      phone,
      address,
      profileImage,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: buildAuthResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeStringValue(email).toLowerCase();

    if (!normalizedEmail || typeof password !== "string" || password.length === 0) {
      throw createHttpError("Email and password are required.", 400);
    }

    if (!process.env.JWT_SECRET) {
      throw createHttpError("JWT_SECRET is not configured.", 500);
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw createHttpError("Invalid email or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw createHttpError("Invalid email or password.", 401);
    }

    if (!user.isActive) {
      throw createHttpError(
        "Your account is inactive. Please contact support.",
        403
      );
    }

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: buildAuthResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
