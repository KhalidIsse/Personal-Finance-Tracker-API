import { ZodError } from "zod";
import multer from "multer";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (req, _res, next) => next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  if (err instanceof ZodError) {
    status = 400;
    message = "Validation failed";
    details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File too large (max 2 MB)" : err.message;
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = "Resource already exists";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Invalid or expired token";
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message: status >= 500 && process.env.NODE_ENV === "production" ? "Internal server error" : message, details });
}
