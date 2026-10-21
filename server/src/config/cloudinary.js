import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

export const cloudinaryReady = Boolean(
  env.cloudinary.cloud_name && env.cloudinary.api_key && env.cloudinary.api_secret
);
if (cloudinaryReady) cloudinary.config({ ...env.cloudinary, secure: true });

export default cloudinary;
