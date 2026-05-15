import express from "express";
import { body, param } from "express-validator";
import {
  createBanner,
  deleteBanner,
  getBanners,
  listAdminBanners,
  toggleBannerStatus,
  updateBanner,
} from "../controllers/bannerController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { adminLimiter, uploadLimiter } from "../middlewares/rateLimiter.js";
import { uploadBannerImage } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

const bannerIdParam = param("id")
  .isMongoId()
  .withMessage("Valid banner id is required");

const isHttpImageUrl = (value) => {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) return true;

  try {
    const parsed = new URL(imageUrl);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
};

const isBannerLink = (value) => {
  const link = String(value || "").trim();
  if (!link) return true;

  if (link.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(link);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
};

const bannerFieldValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Banner title is required")
    .isLength({ max: 140 })
    .withMessage("Banner title cannot exceed 140 characters"),
  body("subtitle")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 240 })
    .withMessage("Banner subtitle cannot exceed 240 characters"),
  body("image")
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Banner image must be a valid URL"),
  body("buttonText")
    .trim()
    .notEmpty()
    .withMessage("Banner button text is required")
    .isLength({ max: 60 })
    .withMessage("Banner button text cannot exceed 60 characters"),
  body("link")
    .trim()
    .notEmpty()
    .withMessage("Banner link is required")
    .custom(isBannerLink)
    .withMessage("Banner link must be a valid route or URL"),
  body("order")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Banner order must be a non-negative number"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body().custom((_, { req }) => {
    const image = String(req.body.image || "").trim();

    if (!req.file && !image) {
      throw new Error("Banner image is required");
    }

    return true;
  }),
];

const bannerUpdateValidation = [
  bannerIdParam,
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 140 })
    .withMessage("Banner title cannot exceed 140 characters"),
  body("subtitle")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 240 })
    .withMessage("Banner subtitle cannot exceed 240 characters"),
  body("image")
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Banner image must be a valid URL"),
  body("buttonText")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 60 })
    .withMessage("Banner button text cannot exceed 60 characters"),
  body("link")
    .optional()
    .trim()
    .notEmpty()
    .custom(isBannerLink)
    .withMessage("Banner link must be a valid route or URL"),
  body("order")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Banner order must be a non-negative number"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

router.get("/", getBanners);
router.get("/manage", adminLimiter, adminAuth, listAdminBanners);
router.post(
  "/",
  adminLimiter,
  adminAuth,
  uploadLimiter,
  uploadBannerImage,
  bannerFieldValidation,
  validateRequest,
  createBanner,
);
router.put(
  "/:id",
  adminLimiter,
  adminAuth,
  uploadLimiter,
  uploadBannerImage,
  bannerUpdateValidation,
  validateRequest,
  updateBanner,
);
router.patch(
  "/:id/toggle",
  adminLimiter,
  adminAuth,
  bannerIdParam,
  validateRequest,
  toggleBannerStatus,
);
router.delete(
  "/:id",
  adminLimiter,
  adminAuth,
  bannerIdParam,
  validateRequest,
  deleteBanner,
);

export default router;
