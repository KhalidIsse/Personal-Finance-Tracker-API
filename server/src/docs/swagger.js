import swaggerJsdoc from "swagger-jsdoc";
import { env } from "../config/env.js";

const servers = [{ url: env.apiUrl, description: env.nodeEnv === "production" ? "Production (Render)" : "Current" }];
if (!env.apiUrl.includes("localhost")) servers.push({ url: "http://localhost:5000", description: "Local" });

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Personal Finance Tracker API",
      version: "1.0.0",
      description:
        "Track income and expenses, organise them by category, view monthly summaries and manage a profile picture.\n\n" +
        "Click **Authorize** and paste the token from `/auth/login`. Amounts are stored as positive numbers; `type` sets the direction.",
    },
    servers,
    tags: [
      { name: "Auth", description: "Registration, login and profile" },
      { name: "Transactions", description: "Income and expense records" },
      { name: "Categories", description: "Predefined and custom categories" },
      { name: "Upload", description: "Profile picture upload (Cloudinary)" },
      { name: "Admin", description: "Admin-only endpoints" },
    ],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            details: { type: "array", items: { type: "object" } },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Ada Lovelace" },
            email: { type: "string", example: "ada@example.com" },
            role: { type: "string", enum: ["user", "admin"] },
            profilePicture: { type: "object", properties: { url: { type: "string" }, publicId: { type: "string" } } },
          },
        },
        TransactionInput: {
          type: "object",
          required: ["title", "amount", "type", "category"],
          properties: {
            title: { type: "string", example: "Groceries" },
            amount: { type: "number", example: -50, description: "Positive or negative; stored as an absolute value" },
            type: { type: "string", enum: ["income", "expense"] },
            category: { type: "string", example: "Food" },
            date: { type: "string", format: "date", example: "2025-05-27" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            amount: { type: "number", example: 50 },
            type: { type: "string", enum: ["income", "expense"] },
            category: { type: "string" },
            date: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Food" },
            type: { type: "string", enum: ["income", "expense"] },
            user: { type: "string", nullable: true },
          },
        },
      },
      responses: {
        Unauthorized: { description: "Missing or invalid token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        ValidationError: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        NotFound: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },
  apis: ["./src/docs/paths.js"],
});
