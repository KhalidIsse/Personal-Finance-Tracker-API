import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerSpec } from "./docs/swagger.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/categories.js";
import uploadRoutes from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.set("trust proxy", 1); // Render sits behind a proxy – needed for correct client IPs in rate limiting
app.use(helmet());
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));

const limiter = (max, windowMin = 15) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  });

app.use(limiter(300));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.json({ name: "Personal Finance Tracker API", docs: "/docs" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: "Finance Tracker API" }));

app.use("/auth/login", limiter(10));
app.use("/auth/register", limiter(10));
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/upload", uploadRoutes);
app.use("/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
