import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { ensureDefaultCategories } from "./models/Category.js";

async function start() {
  await connectDB();
  await ensureDefaultCategories();
  app.listen(env.port, () => console.log(`API listening on port ${env.port} – docs at /docs`));
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
