import { Router } from "express";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";
import {
  createTransactionBody,
  updateTransactionBody,
  idParams,
  listTransactionsQuery,
  summaryQuery,
} from "../schemas/index.js";

const router = Router();
router.use(auth);

const currentMonth = () => new Date().toISOString().slice(0, 7);
const monthRange = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return { $gte: new Date(Date.UTC(y, mo - 1, 1)), $lt: new Date(Date.UTC(y, mo, 1)) };
};

// The category must be a default one or one of the user's own, and match the transaction type.
async function assertCategory(userId, name, type) {
  const cat = await Category.findOne({ name, type, $or: [{ user: null }, { user: userId }] });
  if (!cat) throw new HttpError(400, `Unknown ${type} category "${name}". See GET /categories.`);
}

// Must be declared before "/:id" so "monthly-summary" isn't treated as an id.
router.get(
  "/monthly-summary",
  validate({ query: summaryQuery }),
  asyncHandler(async (req, res) => {
    const month = req.query.month || currentMonth();
    const rows = await Transaction.aggregate([
      { $match: { user: req.user._id, date: monthRange(month) } },
      { $group: { _id: { category: "$category", type: "$type" }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const byCategory = rows.map((r) => ({ category: r._id.category, type: r._id.type, total: r.total, count: r.count }));
    const sum = (t) => byCategory.filter((c) => c.type === t).reduce((a, c) => a + c.total, 0);
    const totalIncome = sum("income");
    const totalExpense = sum("expense");
    res.json({ success: true, month, totalIncome, totalExpense, balance: totalIncome - totalExpense, byCategory });
  })
);

router.get(
  "/",
  validate({ query: listTransactionsQuery }),
  asyncHandler(async (req, res) => {
    const { page, limit, type, category, month } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (month) filter.date = monthRange(month);

    const [data, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Transaction.countDocuments(filter),
    ]);
    res.json({ success: true, data, page, limit, total, pages: Math.ceil(total / limit) });
  })
);

router.post(
  "/",
  validate({ body: createTransactionBody }),
  asyncHandler(async (req, res) => {
    const { amount, type, category } = req.body;
    await assertCategory(req.user._id, category, type);
    const tx = await Transaction.create({ ...req.body, amount: Math.abs(amount), user: req.user._id });
    res.status(201).json({ success: true, data: tx });
  })
);

// Every lookup is scoped by user: users can never read or modify someone else's data.
router.put(
  "/:id",
  validate({ params: idParams, body: updateTransactionBody }),
  asyncHandler(async (req, res) => {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) throw new HttpError(404, "Transaction not found");

    const next = { ...req.body };
    if (next.amount !== undefined) next.amount = Math.abs(next.amount);
    const type = next.type ?? tx.type;
    const category = next.category ?? tx.category;
    if (next.type || next.category) await assertCategory(req.user._id, category, type);

    tx.set(next);
    await tx.save();
    res.json({ success: true, data: tx });
  })
);

router.delete(
  "/:id",
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tx) throw new HttpError(404, "Transaction not found");
    res.json({ success: true, message: "Transaction deleted" });
  })
);

export default router;
