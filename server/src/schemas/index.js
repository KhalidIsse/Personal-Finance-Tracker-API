import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM");

// NOTE: `role` is intentionally absent – Zod strips unknown keys, so users can never self-assign a role.
export const registerBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const transactionBase = z.object({
  title: z.string().trim().min(1).max(100),
  amount: z.number().refine((n) => n !== 0, "Amount cannot be zero"),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(50),
  date: z.coerce.date().optional(),
});

const incomeMustBePositive = (d, ctx) => {
  if (d.type === "income" && d.amount !== undefined && d.amount < 0) {
    ctx.addIssue({ code: "custom", path: ["amount"], message: "Income amount must be positive" });
  }
};

// Accepts -50 for an expense (as in the brief) or 50 – both are stored as 50.
export const createTransactionBody = transactionBase.superRefine(incomeMustBePositive);
export const updateTransactionBody = transactionBase
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Provide at least one field to update")
  .superRefine(incomeMustBePositive);

export const idParams = z.object({ id: objectId });

export const listTransactionsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().trim().optional(),
  month: month.optional(),
});

export const summaryQuery = z.object({ month: month.optional() });

export const createCategoryBody = z.object({
  name: z.string().trim().min(1).max(50),
  type: z.enum(["income", "expense"]),
});
