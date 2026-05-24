import express from "express";
import mongoose from "mongoose";
import { body, param, query } from "express-validator";
import {
  bulkCreateProducts,
  createProduct,
  deleteProduct,
  getBestsellerProducts,
  getLatestProducts,
  getLowStockProducts,
  getProductById,
  getProducts,
  removeProductBestseller,
  updateProduct,
  updateProductBestseller,
} from "../controllers/productController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { adminLimiter, uploadLimiter } from "../middlewares/rateLimiter.js";
import { uploadProductImages } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

const productIdParam = param("id")
  .isMongoId()
  .withMessage("Valid product id is required");

const isValidCategoryIdList = (value) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  const items = Array.isArray(value)
    ? value
    : String(value)
        .split(/[|,]/g)
        .map((item) => item.trim())
        .filter(Boolean);

  return items.every((item) => mongoose.Types.ObjectId.isValid(String(item)));
};

const requireProductImages = (req, res, next) => {
  const hasUploadedImage = Array.isArray(req.files) && req.files.length > 0;

  if (hasUploadedImage) {
    next();
    return;
  }

  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: [{ field: "images", message: "At least one product image is required" }],
  });
};

const productQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minPrice must be positive"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxPrice must be positive"),
  query("category").optional().trim().isLength({ max: 120 }),
  query("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Valid category id is required"),
  query("gender").optional().trim().isLength({ max: 40 }),
  query("brandId")
    .optional()
    .isMongoId()
    .withMessage("Valid brand id is required"),
  query("brand").optional().trim().isLength({ max: 120 }),
  query("search").optional().trim().isLength({ max: 160 }),
];

const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 160 }),
  body("brand").optional().trim().isLength({ max: 120 }),
  body("brandId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Valid brand id is required"),
  body().custom((_, { req }) => {
    const hasBrand = Boolean(String(req.body.brand || "").trim());
    const hasBrandId = Boolean(String(req.body.brandId || "").trim());

    if (hasBrand || hasBrandId) {
      return true;
    }

    throw new Error("Brand is required");
  }),
  body("category").optional().trim().isLength({ max: 240 }),
  body("categories").optional().custom(() => true),
  body("categoryId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Valid category id is required"),
  body("categoryIds")
    .optional({ values: "falsy" })
    .custom(isValidCategoryIdList)
    .withMessage("categoryIds must contain valid category ids"),
  body().custom((_, { req }) => {
    const hasCategory = Boolean(String(req.body.category || "").trim());
    const hasCategoryId = Boolean(String(req.body.categoryId || "").trim());
    const hasCategoryIds = Boolean(
      Array.isArray(req.body.categoryIds)
        ? req.body.categoryIds.length
        : String(req.body.categoryIds || "").trim(),
    );
    const hasCategories = Boolean(
      Array.isArray(req.body.categories)
        ? req.body.categories.length
        : String(req.body.categories || "").trim(),
    );

    if (hasCategory || hasCategoryId || hasCategoryIds || hasCategories) {
      return true;
    }

    throw new Error("Category is required");
  }),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be positive"),
  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be positive"),
  body("isLatest")
    .optional()
    .isBoolean()
    .withMessage("isLatest must be a boolean"),
  body("description").optional().trim().isLength({ max: 4000 }),
  body("type").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
];

const updateProductValidation = [
  productIdParam,
  body("name").optional().trim().notEmpty().isLength({ max: 160 }),
  body("brand").optional().trim().isLength({ max: 120 }),
  body("brandId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Valid brand id is required"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 240 }),
  body("categories").optional().custom(() => true),
  body("categoryId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Valid category id is required"),
  body("categoryIds")
    .optional({ values: "falsy" })
    .custom(isValidCategoryIdList)
    .withMessage("categoryIds must contain valid category ids"),
  body("price")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Price must be positive"),
  body("stock")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Stock must be positive"),
  body("existingImages")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (Array.isArray(value)) return value.length <= 5;

      try {
        const parsed = JSON.parse(String(value || "[]"));
        return Array.isArray(parsed) && parsed.length <= 5;
      } catch (_error) {
        return false;
      }
    })
    .withMessage("existingImages must be a valid image list"),
  body("isLatest")
    .optional()
    .isBoolean()
    .withMessage("isLatest must be a boolean"),
  body("description").optional().trim().isLength({ max: 4000 }),
  body("type").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
];

const updateBestsellerValidation = [
  productIdParam,
  body("isBestseller")
    .optional()
    .isBoolean()
    .withMessage("isBestseller must be a boolean"),
  body("bestsellerOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("bestsellerOrder must be a non-negative integer"),
  body("displayOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("displayOrder must be a non-negative integer"),
  body().custom((_, { req }) => {
    if (
      req.body.isBestseller === undefined &&
      req.body.bestsellerOrder === undefined &&
      req.body.displayOrder === undefined
    ) {
      throw new Error(
        "Provide isBestseller or bestsellerOrder to update bestseller settings",
      );
    }

    return true;
  }),
];

router.get("/", productQueryValidation, validateRequest, getProducts);
router.get("/bestsellers", getBestsellerProducts);
router.get("/latest", getLatestProducts);
router.get("/low-stock", adminLimiter, adminAuth, getLowStockProducts);
router.get("/:id", productIdParam, validateRequest, getProductById);
router.post(
  "/bulk",
  adminLimiter,
  adminAuth,
  body("products")
    .isArray({ min: 1, max: 500 })
    .withMessage("products must contain 1-500 rows"),
  body("products.*.name").optional().trim().isLength({ max: 160 }),
  body("products.*.brand").optional().trim().isLength({ max: 120 }),
  body("products.*.category").optional().trim().isLength({ max: 120 }),
  body("products.*.description").optional({ values: "falsy" }).trim().isLength({ max: 4000 }),
  body("products.*.type").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  validateRequest,
  bulkCreateProducts,
);
router.post(
  "/",
  adminLimiter,
  adminAuth,
  uploadLimiter,
  uploadProductImages,
  requireProductImages,
  createProductValidation,
  validateRequest,
  createProduct,
);
router.put(
  "/:id",
  adminLimiter,
  adminAuth,
  uploadLimiter,
  uploadProductImages,
  updateProductValidation,
  validateRequest,
  updateProduct,
);
router.patch(
  "/:id/bestseller",
  adminLimiter,
  adminAuth,
  updateBestsellerValidation,
  validateRequest,
  updateProductBestseller,
);
router.put(
  "/:id/bestseller",
  adminLimiter,
  adminAuth,
  updateBestsellerValidation,
  validateRequest,
  updateProductBestseller,
);
router.put(
  "/:id/remove-bestseller",
  adminLimiter,
  adminAuth,
  [productIdParam],
  validateRequest,
  removeProductBestseller,
);
router.delete(
  "/:id",
  adminLimiter,
  adminAuth,
  productIdParam,
  validateRequest,
  deleteProduct,
);

export default router;
