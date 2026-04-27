import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  bulkCreateBrands,
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "../controllers/brandController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { uploadBrandLogo } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { BRAND_CATEGORIES } from "../models/Brand.js";

const router = Router();

const brandIdParam = param("id")
  .isMongoId()
  .withMessage("Valid brand id is required");

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

const brandValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ max: 120 }),
  body("logo")
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Brand logo must be a valid URL"),
  body("category")
    .isIn(BRAND_CATEGORIES)
    .withMessage("Invalid brand category"),
];

const brandUpdateValidation = [
  brandIdParam,
  body("name").optional().trim().notEmpty().isLength({ max: 120 }),
  body("logo")
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Brand logo must be a valid URL"),
  body("category")
    .optional()
    .isIn(BRAND_CATEGORIES)
    .withMessage("Invalid brand category"),
];

router.get(
  "/",
  [
    query("category")
      .optional()
      .isIn(BRAND_CATEGORIES)
      .withMessage("Invalid brand category"),
  ],
  validateRequest,
  getBrands,
);
router.get("/:id", brandIdParam, validateRequest, getBrandById);
router.post(
  "/bulk",
  adminAuth,
  [
    body("brands")
      .isArray({ min: 1, max: 500 })
      .withMessage("brands must be a non-empty array"),
    body("brands.*.name").optional().isLength({ max: 120 }),
    body("brands.*.category").optional().isLength({ max: 40 }),
    body("brands.*.logo").optional({ values: "falsy" }).isLength({ max: 1000 }),
  ],
  validateRequest,
  bulkCreateBrands,
);
router.post(
  "/",
  adminAuth,
  uploadBrandLogo,
  brandValidation,
  validateRequest,
  createBrand,
);
router.put(
  "/:id",
  adminAuth,
  uploadBrandLogo,
  brandUpdateValidation,
  validateRequest,
  updateBrand,
);
router.delete(
  "/:id",
  adminAuth,
  brandIdParam,
  validateRequest,
  deleteBrand,
);

export default router;
