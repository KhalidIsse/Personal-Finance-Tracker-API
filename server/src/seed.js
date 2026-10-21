import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import { ensureDefaultCategories } from "./models/Category.js";

await connectDB();
await ensureDefaultCategories();
console.log("Default categories ready");

const { ADMIN_NAME = "Admin", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  const email = ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`Promoted ${email} to admin`);
  } else {
    await User.create({ name: ADMIN_NAME, email, password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: "admin" });
    console.log(`Created admin ${email}`);
  }
}
await mongoose.disconnect();
