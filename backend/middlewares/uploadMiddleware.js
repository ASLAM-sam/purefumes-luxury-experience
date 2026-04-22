import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads", "products");

fs.mkdirSync(uploadDir, { recursive: true });

cloudinary.config({ secure: true });

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, uploadDir);
  },
  filename(_req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)+/g, "")
      .toLowerCase();
    callback(null, `${Date.now()}-${safeName || "product"}${ext}`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new Error("Only image uploads are allowed"));
    return;
  }

  callback(null, true);
};

const productImageUploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },
}).array("images", 3);

export const uploadProductImages = (req, res, next) => {
  productImageUploader(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Image upload failed",
      });
    }

    req.files = Array.isArray(req.files) ? req.files : [];
    next();
  });
};

export const storeUploadedImage = async (file) => {
  if (process.env.CLOUDINARY_URL) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "purefumes-hyderabad/products",
      resource_type: "image",
    });
    await fs.promises.unlink(file.path).catch(() => undefined);
    return result.secure_url;
  }

  return `/uploads/products/${file.filename}`;
};

export const cleanupUploadedFiles = async (files = []) => {
  await Promise.all(files.map((file) => fs.promises.unlink(file.path).catch(() => undefined)));
};
