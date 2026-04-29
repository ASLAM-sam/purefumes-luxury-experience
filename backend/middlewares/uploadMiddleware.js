import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");
const productUploadDir = path.join(uploadsRoot, "products");
const brandUploadDir = path.join(uploadsRoot, "brands");
const bannerUploadDir = path.join(uploadsRoot, "banners");
const perfumeRequestUploadDir = path.join(uploadsRoot, "requests");

[productUploadDir, brandUploadDir, bannerUploadDir, perfumeRequestUploadDir].forEach(
  (directory) => {
    fs.mkdirSync(directory, { recursive: true });
  },
);

cloudinary.config({ secure: true });

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, productUploadDir);
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

const brandStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, brandUploadDir);
  },
  filename(_req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)+/g, "")
      .toLowerCase();
    callback(null, `${Date.now()}-${safeName || "brand"}${ext}`);
  },
});

const bannerStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, bannerUploadDir);
  },
  filename(_req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)+/g, "")
      .toLowerCase();
    callback(null, `${Date.now()}-${safeName || "banner"}${ext}`);
  },
});

const perfumeRequestStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, perfumeRequestUploadDir);
  },
  filename(_req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)+/g, "")
      .toLowerCase();
    callback(null, `${Date.now()}-${safeName || "request"}${ext}`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new Error("Only image uploads are allowed"));
    return;
  }

  callback(null, true);
};

const perfumeRequestFileFilter = (_req, file, callback) => {
  const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new Error("Only JPG, PNG, and WEBP images are allowed"));
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
  if (process.env.CLOUDINARY_URL) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: cloudinaryFolder,
      resource_type: "image",
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
