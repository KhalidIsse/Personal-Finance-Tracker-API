import { Router } from "express";
import Category from "../models/Category.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { createCategoryBody } from "../schemas/index.js";

const router = Router();
router.use(auth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await Category.find({ $or: [{ user: null }, { user: req.user._id }] }).sort({ type: 1, name: 1 });
    res.json({ success: true, data });
  })
);

router.post(
  "/",
  validate({ body: createCategoryBody }),
  asyncHandler(async (req, res) => {
    const category = await Category.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: category });
  })
);

export default router;
