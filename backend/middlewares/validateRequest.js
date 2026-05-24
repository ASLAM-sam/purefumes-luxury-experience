import { validationResult } from "express-validator";
import { cleanupUploadedFiles } from "./uploadMiddleware.js";

const collectUploadedFiles = (req) => {
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
    req.categoryImageFile,
    req.categoryBannerImageFile,
    ...(Array.isArray(req.productImageFiles) ? req.productImageFiles : []),
  ]
    .filter(Boolean)
    .forEach((file) => files.push(file));

  return files;
};

export const validateRequest = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    await cleanupUploadedFiles(collectUploadedFiles(req));

    return res.status(422).json({
      success: false,
      message: "Validation failed",
      data: null,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};
