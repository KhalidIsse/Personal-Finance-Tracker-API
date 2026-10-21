import multer from "multer";
import { HttpError } from "./errorHandler.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new HttpError(400, "Only JPEG, PNG or WebP images are allowed")),
}).single("picture");
