import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const args = process.argv.slice(2);

const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const name = getArgValue("--name") || process.env.ADMIN_NAME;
const email = (getArgValue("--email") || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const password = getArgValue("--password") || process.env.ADMIN_PASSWORD;

if (!name || !email || !password) {
  console.error(
    "Usage: npm run create-admin -- --name \"Admin User\" --email admin@example.com --password secret123"
  );
  process.exit(1);
}

const run = async () => {
  try {
    await connectDB();

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        passwordHash,
        role: "admin",
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log(`Admin ready: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

run();
