import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";
import { registerBody, loginBody } from "../schemas/index.js";

const router = Router();
const signToken = (user) => jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

router.post(
  "/register",
  validate({ body: registerBody }),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.exists({ email })) throw new HttpError(409, "Email is already registered");
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "user" });
    res.status(201).json({ success: true, token: signToken(user), user });
  })
);

router.post(
  "/login",
  validate({ body: loginBody }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    const ok = user && (await bcrypt.compare(req.body.password, user.password));
    if (!ok) throw new HttpError(401, "Invalid email or password");
    res.json({ success: true, token: signToken(user), user });
  })
);

router.get("/profile", auth, (req, res) => res.json({ success: true, user: req.user }));

export default router;
