import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";
import sharp from "sharp";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");
const tempImageUploadDir = path.join(uploadsRoot, "tmp");
const productUploadDir = path.join(uploadsRoot, "products");
const productVideoUploadDir = path.join(uploadsRoot, "product-videos");
const brandUploadDir = path.join(uploadsRoot, "brands");
const bannerUploadDir = path.join(uploadsRoot, "banners");
const categoryUploadDir = path.join(uploadsRoot, "categories");
const perfumeRequestUploadDir = path.join(uploadsRoot, "requests");

const IMAGE_SIZE_LIMIT_BYTES = 5 * 1024 * 1024;
const VIDEO_SIZE_LIMIT_BYTES = 10 * 1024 * 1024;
const WEBP_QUALITY = 80;
const MAX_IMAGE_INPUT_PIXELS = 50_000_000;
const IMAGE_UPLOAD_MESSAGE = "Only JPG, PNG, and WEBP images are allowed";
const IMAGE_SIZE_MESSAGE = "Image size must be under 5MB";
const VIDEO_SIZE_MESSAGE = "Video size must be under 10MB";

[
  tempImageUploadDir,
  productUploadDir,
  productVideoUploadDir,
  brandUploadDir,
  bannerUploadDir,
  categoryUploadDir,
  perfumeRequestUploadDir,
].forEach((directory) => {
  fs.mkdirSync(directory, { recursive: true });
});

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "application/octet-stream",
]);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedDecodedImageFormats = new Set(["jpeg", "png", "webp"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const allowedVideoExtensions = new Set([".mp4", ".webm", ".mov"]);

class UploadValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "UploadValidationError";
    this.statusCode = statusCode;
  }
}

const isVideoField = (fieldname = "") =>
  fieldname === "video" || fieldname === "videoFile";

const normalizeMimeType = (mimetype = "") => String(mimetype || "").trim().toLowerCase();

const normalizeExtension = (filename = "") =>
  path.extname(String(filename || "")).toLowerCase();

const sanitizeBaseName = (filename = "", fallback = "upload") => {
  const parsedFilename = path.parse(String(filename || ""));
  const safeName = path
    .basename(parsedFilename.name || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)+/g, "")
    .toLowerCase()
    .slice(0, 80);

  return safeName || fallback;
};

const getSafeUploadFilename = (file, fallback, extension = normalizeExtension(file.originalname)) => {
  const safeName = sanitizeBaseName(file.originalname, fallback);
  const randomSuffix = crypto.randomBytes(8).toString("hex");

  return `${Date.now()}-${randomSuffix}-${safeName}${extension}`;
};

const isAllowedImageCandidate = (file) =>
  allowedImageExtensions.has(normalizeExtension(file.originalname)) &&
  allowedImageMimeTypes.has(normalizeMimeType(file.mimetype));

const isAllowedVideo = (file) =>
  allowedVideoTypes.has(normalizeMimeType(file.mimetype)) &&
  allowedVideoExtensions.has(normalizeExtension(file.originalname));

const createImageFileFilter = (_req, file, callback) => {
  if (!isAllowedImageCandidate(file)) {
    callback(new UploadValidationError(IMAGE_UPLOAD_MESSAGE));
    return;
  }

  callback(null, true);
};

const productMediaFileFilter = (_req, file, callback) => {
  if (isVideoField(file.fieldname)) {
    if (!isAllowedVideo(file)) {
      callback(new UploadValidationError("Only MP4, WebM, or MOV video uploads are allowed"));
      return;
    }

    callback(null, true);
    return;
  }

  if (!isAllowedImageCandidate(file)) {
    callback(new UploadValidationError(IMAGE_UPLOAD_MESSAGE));
    return;
  }

  callback(null, true);
};

const productStorage = multer.diskStorage({
  destination(_req, file, callback) {
    callback(null, isVideoField(file.fieldname) ? productVideoUploadDir : tempImageUploadDir);
  },
  filename(_req, file, callback) {
    callback(null, getSafeUploadFilename(file, isVideoField(file.fieldname) ? "product-video" : "product"));
  },
});

const createTempImageStorage = (fallback) =>
  multer.diskStorage({
    destination(_req, _file, callback) {
      callback(null, tempImageUploadDir);
    },
    filename(_req, file, callback) {
      callback(null, getSafeUploadFilename(file, fallback));
    },
  });

const deleteFile = async (filePath) => {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => undefined);
};

const getUploadedFilesFromRequest = (req) => {
  const files = [];

  if (req.file) {
    files.push(req.file);
  }

  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === "object") {
    Object.values(req.files).forEach((fieldFiles) => {
      if (Array.isArray(fieldFiles)) {
        files.push(...fieldFiles);
      }
    });
  }

  [
    req.productVideoFile,
    req.categoryImageFile,
    req.categoryBannerImageFile,
    ...(Array.isArray(req.productImageFiles) ? req.productImageFiles : []),
  ]
    .filter(Boolean)
    .forEach((file) => files.push(file));

  return files;
};

export const cleanupUploadedFiles = async (files = []) => {
  const uniquePaths = [
    ...new Set(
      files
        .flat()
        .filter(Boolean)
        .map((file) => (typeof file === "string" ? file : file.path))
        .filter(Boolean),
    ),
  ];

  await Promise.all(uniquePaths.map((filePath) => deleteFile(filePath)));
};

const assertImageSizeLimit = async (files = []) => {
  const oversizedImage = files.find((file) => Number(file.size || 0) > IMAGE_SIZE_LIMIT_BYTES);

  if (oversizedImage) {
    throw new UploadValidationError(IMAGE_SIZE_MESSAGE);
  }
};

const convertImageToWebp = async (file, { destination, fallback }) => {
  const originalPath = file.path;
  const webpFilename = getSafeUploadFilename(file, fallback, ".webp");
  const webpPath = path.join(destination, webpFilename);

  try {
    const pipeline = sharp(originalPath, {
      failOn: "truncated",
      limitInputPixels: MAX_IMAGE_INPUT_PIXELS,
    });
    const metadata = await pipeline.metadata();

    if (!allowedDecodedImageFormats.has(metadata.format)) {
      throw new UploadValidationError(IMAGE_UPLOAD_MESSAGE);
    }

    await pipeline
      .rotate()
      .webp({
        quality: WEBP_QUALITY,
        effort: 4,
      })
      .toFile(webpPath);

    const convertedStats = await fs.promises.stat(webpPath);
    await deleteFile(originalPath);

    return {
      ...file,
      destination,
      filename: webpFilename,
      path: webpPath,
      mimetype: "image/webp",
      size: convertedStats.size,
      optimized: true,
    };
  } catch (error) {
    await Promise.all([deleteFile(originalPath), deleteFile(webpPath)]);

    if (error instanceof UploadValidationError) {
      throw error;
    }

    throw new UploadValidationError("Uploaded file is not a valid JPG, PNG, or WEBP image");
  }
};

const convertImagesToWebp = async (files = [], options) => {
  const convertedFiles = [];

  try {
    for (const file of files) {
      convertedFiles.push(await convertImageToWebp(file, options));
    }

    return convertedFiles;
  } catch (error) {
    await cleanupUploadedFiles([...files, ...convertedFiles]);
    throw error;
  }
};

const sendUploadError = async (req, res, error, fallbackMessage) => {
  await cleanupUploadedFiles(getUploadedFilesFromRequest(req));

  let message = error.message || fallbackMessage;

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      message = isVideoField(error.field) ? VIDEO_SIZE_MESSAGE : IMAGE_SIZE_MESSAGE;
    } else if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Too many files were uploaded";
    } else {
      message = fallbackMessage;
    }
  }

  return res.status(error.statusCode || 400).json({
    success: false,
    message,
  });
};

const registerFailedResponseCleanup = (req, res) => {
  if (req.uploadCleanupRegistered) return;

  req.uploadCleanupRegistered = true;
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      void cleanupUploadedFiles(getUploadedFilesFromRequest(req));
    }
  });
};

const productMediaUploader = multer({
  storage: productStorage,
  fileFilter: productMediaFileFilter,
  limits: {
    fileSize: VIDEO_SIZE_LIMIT_BYTES,
    files: 6,
  },
}).fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
  { name: "videoFile", maxCount: 1 },
]);

const brandLogoUploader = multer({
  storage: createTempImageStorage("brand"),
  fileFilter: createImageFileFilter,
  limits: {
    fileSize: IMAGE_SIZE_LIMIT_BYTES,
    files: 1,
  },
}).single("logo");

const bannerImageUploader = multer({
  storage: createTempImageStorage("banner"),
  fileFilter: createImageFileFilter,
  limits: {
    fileSize: IMAGE_SIZE_LIMIT_BYTES,
    files: 1,
  },
}).single("imageFile");

const categoryAssetUploader = multer({
  storage: createTempImageStorage("category"),
  fileFilter: createImageFileFilter,
  limits: {
    fileSize: IMAGE_SIZE_LIMIT_BYTES,
    files: 2,
  },
}).fields([
  { name: "imageFile", maxCount: 1 },
  { name: "bannerImageFile", maxCount: 1 },
]);

const perfumeRequestImageUploader = multer({
  storage: createTempImageStorage("request"),
  fileFilter: createImageFileFilter,
  limits: {
    fileSize: IMAGE_SIZE_LIMIT_BYTES,
    files: 3,
  },
}).array("images", 3);

export const uploadProductImages = (req, res, next) => {
  productMediaUploader(req, res, async (error) => {
    if (error) {
      return sendUploadError(req, res, error, "Product media upload failed");
    }

    const filesByField = req.files && !Array.isArray(req.files) ? req.files : {};
    const imageFiles = Array.isArray(filesByField.images) ? filesByField.images : [];
    const videoFiles = [
      ...(Array.isArray(filesByField.video) ? filesByField.video : []),
      ...(Array.isArray(filesByField.videoFile) ? filesByField.videoFile : []),
    ];

    try {
      await assertImageSizeLimit(imageFiles);
      const convertedImages = await convertImagesToWebp(imageFiles, {
        destination: productUploadDir,
        fallback: "product",
      });

      req.productImageFiles = convertedImages;
      req.productVideoFile = videoFiles[0] || null;
      req.files = convertedImages;
      registerFailedResponseCleanup(req, res);
      next();
    } catch (conversionError) {
      await cleanupUploadedFiles(videoFiles);
      return sendUploadError(req, res, conversionError, "Product media upload failed");
    }
  });
};

export const uploadBrandLogo = (req, res, next) => {
  brandLogoUploader(req, res, async (error) => {
    if (error) {
      return sendUploadError(req, res, error, "Logo upload failed");
    }

    try {
      if (req.file) {
        req.file = (await convertImagesToWebp([req.file], {
          destination: brandUploadDir,
          fallback: "brand",
        }))[0];
      }

      registerFailedResponseCleanup(req, res);
      next();
    } catch (conversionError) {
      return sendUploadError(req, res, conversionError, "Logo upload failed");
    }
  });
};

export const uploadBannerImage = (req, res, next) => {
  bannerImageUploader(req, res, async (error) => {
    if (error) {
      return sendUploadError(req, res, error, "Banner image upload failed");
    }

    try {
      if (req.file) {
        req.file = (await convertImagesToWebp([req.file], {
          destination: bannerUploadDir,
          fallback: "banner",
        }))[0];
      }

      registerFailedResponseCleanup(req, res);
      next();
    } catch (conversionError) {
      return sendUploadError(req, res, conversionError, "Banner image upload failed");
    }
  });
};

export const uploadCategoryAssets = (req, res, next) => {
  categoryAssetUploader(req, res, async (error) => {
    if (error) {
      return sendUploadError(req, res, error, "Category asset upload failed");
    }

    const filesByField = req.files && !Array.isArray(req.files) ? req.files : {};
    const imageFile = Array.isArray(filesByField.imageFile) ? filesByField.imageFile[0] : null;
    const bannerImageFile = Array.isArray(filesByField.bannerImageFile)
      ? filesByField.bannerImageFile[0]
      : null;

    try {
      const convertedAssets = await convertImagesToWebp(
        [imageFile, bannerImageFile].filter(Boolean),
        {
          destination: categoryUploadDir,
          fallback: "category",
        },
      );

      req.categoryImageFile = convertedAssets[0] || null;
      req.categoryBannerImageFile = convertedAssets[1] || null;
      registerFailedResponseCleanup(req, res);
      next();
    } catch (conversionError) {
      return sendUploadError(req, res, conversionError, "Category asset upload failed");
    }
  });
};

export const uploadPerfumeRequestImages = (req, res, next) => {
  perfumeRequestImageUploader(req, res, async (error) => {
    if (error) {
      return sendUploadError(req, res, error, "Perfume request image upload failed");
    }

    try {
      req.files = await convertImagesToWebp(Array.isArray(req.files) ? req.files : [], {
        destination: perfumeRequestUploadDir,
        fallback: "request",
      });

      registerFailedResponseCleanup(req, res);
      next();
    } catch (conversionError) {
      return sendUploadError(req, res, conversionError, "Perfume request image upload failed");
    }
  });
};

export const storeUploadedImage = async (
  file,
  {
    cloudinaryFolder = "purefumes-hyderabad/products",
    localSubdirectory = "products",
  } = {},
) => {
  if (isCloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: cloudinaryFolder,
      resource_type: "image",
      format: "webp",
    });
    await deleteFile(file.path);
    return result.secure_url || result.url || "";
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
  if (isCloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: cloudinaryFolder,
      resource_type: "video",
    });
    await deleteFile(file.path);
    return result.secure_url;
  }

  return `/uploads/${localSubdirectory}/${file.filename}`;
};
