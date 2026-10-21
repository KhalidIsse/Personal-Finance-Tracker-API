import mongoose from "mongoose";

// user = null  -> predefined category visible to everyone
// user = <id>  -> custom category visible only to that user
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    type: { type: String, enum: ["income", "expense"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, type: 1, user: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export const DEFAULT_CATEGORIES = [
  ...["Food", "Rent", "Transport", "Utilities", "Health", "Entertainment", "Shopping", "Education", "Other"].map(
    (name) => ({ name, type: "expense" })
  ),
  ...["Salary", "Freelance", "Investments", "Gift", "Other Income"].map((name) => ({ name, type: "income" })),
];

export async function ensureDefaultCategories() {
  await Promise.all(
    DEFAULT_CATEGORIES.map((c) =>
      Category.updateOne({ ...c, user: null }, { $setOnInsert: { ...c, user: null } }, { upsert: true })
    )
  );
}

export default Category;
