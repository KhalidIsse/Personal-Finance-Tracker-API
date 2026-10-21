import { Router } from "express";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { auth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();
router.use(auth, requireRole("admin"));

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsersLast30Days, totalTransactions, topSpendingCategories, totals] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: since } }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { type: "expense" } },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, category: "$_id", total: 1, count: 1 } },
      ]),
      Transaction.aggregate([{ $group: { _id: "$type", total: { $sum: "$amount" } } }]),
    ]);
    const t = Object.fromEntries(totals.map((x) => [x._id, x.total]));
    res.json({
      success: true,
      totalUsers,
      newUsersLast30Days,
      totalTransactions,
      totalIncome: t.income || 0,
      totalExpense: t.expense || 0,
      topSpendingCategories,
    });
  })
);

export default router;
