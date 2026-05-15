import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import env from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");
const productUploadDir = path.join(uploadsRoot, "products");
const productVideoUploadDir = path.join(uploadsRoot, "product-videos");
const brandUploadDir = path.join(uploadsRoot, "brands");
const bannerUploadDir = path.join(uploadsRoot, "banners");
const perfumeRequestUploadDir = path.join(uploadsRoot, "requests");

[productUploadDir, productVideoUploadDir, brandUploadDir, bannerUploadDir, perfumeRequestUploadDir].forEach(
  (directory) => {
    fs.mkdirSync(directory, { recursive: true });
  },
);

cloudinary.config({ secure: true });

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const allowedVideoExtensions = new Set([".mp4", ".webm", ".mov"]);

const getSafeUploadFilename = (file, fallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const safeName = path
    .basename(file.originalname, ext)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)+/g, "")
    .toLowerCase()
    .slice(0, 80);
  const randomSuffix = crypto.randomBytes(8).toString("hex");

  return `${Date.now()}-${randomSuffix}-${safeName || fallback}${ext}`;
};

const isAllowedImage = (file) =>
  allowedImageTypes.has(file.mimetype) &&
  allowedImageExtensions.has(path.extname(file.originalname).toLowerCase());

const isAllowedVideo = (file) =>
  allowedVideoTypes.has(file.mimetype) &&
  allowedVideoExtensions.has(path.extname(file.originalname).toLowerCase());

const storage = multer.diskStorage({
  destination(_req, file, callback) {
    callback(null, file.fieldname === "video" || file.fieldname === "videoFile"
      ? productVideoUploadDir
      : productUploadDir);
  },
  filename(_req, file, callback) {
    callback(null, getSafeUploadFilename(file, "product"));
  },
});

const brandStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, brandUploadDir);
  },
  filename(_req, file, callback) {
    callback(null, getSafeUploadFilename(file, "brand"));
  },
});

const bannerStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, bannerUploadDir);
  },
  filename(_req, file, callback) {
    callback(null, getSafeUploadFilename(file, "banner"));
  },
});

const perfumeRequestStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, perfumeRequestUploadDir);
  },
  filename(_req, file, callback) {
    callback(null, getSafeUploadFilename(file, "request"));
  },
});

const fileFilter = (_req, file, callback) => {
  if (!isAllowedImage(file)) {
    callback(new Error("Only JPG, PNG, and WEBP images are allowed"));
    return;
  }

  callback(null, true);
};

const productMediaFileFilter = (_req, file, callback) => {
  const isVideoField = file.fieldname === "video" || file.fieldname === "videoFile";

  if (isVideoField) {
    if (!isAllowedVideo(file)) {
      callback(new Error("Only MP4, WebM, or MOV video uploads are allowed"));
      return;
    }

    callback(null, true);
    return;
  }

  if (!isAllowedImage(file)) {
    callback(new Error("Only JPG, PNG, and WEBP images are allowed"));
    return;
  }

  callback(null, true);
};

const perfumeRequestFileFilter = (_req, file, callback) => {
  if (!isAllowedImage(file)) {
    callback(new Error("Only JPG, PNG, and WEBP images are allowed"));
    return;
  }

  callback(null, true);
};

const productMediaUploader = multer({
  storage,
  fileFilter: productMediaFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 6,
  },
}).fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
  { name: "videoFile", maxCount: 1 },
]);

const brandLogoUploader = multer({
  storage: brandStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
}).single("logo");

const bannerImageUploader = multer({
  storage: bannerStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
}).single("imageFile");

const perfumeRequestImageUploader = multer({
  storage: perfumeRequestStorage,
  fileFilter: perfumeRequestFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },
}).array("images", 3);

export const uploadProductImages = (req, res, next) => {
  productMediaUploader(req, res, async (error) => {
    if (error) {
      const limitMessage =
        error.code === "LIMIT_FILE_SIZE" && error.field === "images"
          ? "Image size must be under 5MB"
          : "Video size must be under 10MB";

      return res.status(400).json({
        success: false,
        message: error.code === "LIMIT_FILE_SIZE"
          ? limitMessage
          : error.message || "Product media upload failed",
      });
    }

    const filesByField = req.files && !Array.isArray(req.files) ? req.files : {};
    const imageFiles = Array.isArray(filesByField.images) ? filesByField.images : [];
    const videoFiles = [
      ...(Array.isArray(filesByField.video) ? filesByField.video : []),
      ...(Array.isArray(filesByField.videoFile) ? filesByField.videoFile : []),
    ];

    const oversizedImage = imageFiles.find((file) => file.size > 5 * 1024 * 1024);
    if (oversizedImage) {
      await cleanupUploadedFiles([...imageFiles, ...videoFiles]);
      return res.status(400).json({
        success: false,
        message: "Image size must be under 5MB",
      });
    }

    req.productImageFiles = imageFiles;
    req.productVideoFile = videoFiles[0] || null;
    req.files = imageFiles;
    next();
  });
};

export const uploadBrandLogo = (req, res, next) => {
  brandLogoUploader(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Logo upload failed",
      });
    }

    next();
  });
};

export const uploadBannerImage = (req, res, next) => {
  bannerImageUploader(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Banner image upload failed",
      });
    }

    next();
  });
};

export const uploadPerfumeRequestImages = (req, res, next) => {
  perfumeRequestImageUploader(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Perfume request image upload failed",
      });
    }

    req.files = Array.isArray(req.files) ? req.files : [];
    next();
  });
};

export const storeUploadedImage = async (
  file,
  {
    cloudinaryFolder = "purefumes-hyderabad/products",
    localSubdirectory = "products",
  } = {},
) => {
  if (env.CLOUDINARY_URL) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: cloudinaryFolder,
      resource_type: "image",
    });
    await fs.promises.unlink(file.path).catch(() => undefined);
    return result.secure_url;
  }

  return `/uploads/${localSubdirectory}/${file.filename}`;
};

export const storeUploadedVideo = async (
  file,
  {
    cloudinaryFolder = "purefumes-hyderabad/product-videos",
    localSubdirectory = "product-videos",
  } = {},
) => {
  if (env.CLOUDINARY_URL) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: cloudinaryFolder,
      resource_type: "video",
    });
    await fs.promises.unlink(file.path).catch(() => undefined);
    return result.secure_url;
  }

  return `/uploads/${localSubdirectory}/${file.filename}`;
};

export const cleanupUploadedFiles = async (files = []) => {
  await Promise.all(
    files.map((file) => fs.promises.unlink(file.path).catch(() => undefined)),
  );
};
