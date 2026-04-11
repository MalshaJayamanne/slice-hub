
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

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
    const normalizedRole = typeof role === "string" ? role.trim().toLowerCase() : "customer";
    const allowedPublicRoles = ["customer", "seller"];

    if (!name || !email || !password) {
      const error = new Error("Name, email, and password are required.");
      error.statusCode = 400;
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured.");
      error.statusCode = 500;
      throw error;
    }

    if (!allowedPublicRoles.includes(normalizedRole)) {
      const error = new Error("Role must be either customer or seller.");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      const error = new Error("User already exists with this email.");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
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

    if (!email || !password) {
      const error = new Error("Email and password are required.");
      error.statusCode = 400;
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured.");
      error.statusCode = 500;
      throw error;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
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
