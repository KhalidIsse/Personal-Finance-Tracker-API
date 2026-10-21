import { Router } from "express";
import cloudinary, { cloudinaryReady } from "../config/cloudinary.js";
import { auth } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

const streamToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => (err ? reject(err) : resolve(result)));
    stream.end(buffer);
  });

router.post(
  "/profile-picture",
  auth,
  uploadImage,
  asyncHandler(async (req, res) => {
    if (!cloudinaryReady) throw new HttpError(503, "Image uploads are not configured on this server");
    if (!req.file) throw new HttpError(400, 'No file received. Send multipart/form-data with a "picture" field.');

    const result = await streamToCloudinary(req.file.buffer, {
      folder: "finance-tracker/avatars",
      public_id: `user_${req.user._id}`,
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "auto" }],
    });

    req.user.profilePicture = { url: result.secure_url, publicId: result.public_id };
    await req.user.save();
    res.json({ success: true, user: req.user });
  })
);

export default router;
