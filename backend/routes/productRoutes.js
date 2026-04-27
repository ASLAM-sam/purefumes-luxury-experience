import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  bulkCreateProducts,
  createProduct,
  deleteProduct,
  getLowStockProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import {
  PRODUCT_BEST_TIMES,
  PRODUCT_CATEGORIES,
  PRODUCT_SEASONS,
  PRODUCT_USAGES,
} from "../models/Product.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { uploadProductImages } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

const productIdParam = param("id")
  .isMongoId()
  .withMessage("Valid product id is required");

const validSeasons = (value) => {
  const seasons = Array.isArray(value)
    ? value
    : String(value).trim().startsWith("[")
      ? JSON.parse(value)
      : String(value).split(",");
  return seasons.every((season) =>
    PRODUCT_SEASONS.includes(String(season).trim()),
  );
};

const validBestTimes = (value) => {
  const times = Array.isArray(value)
    ? value
    : String(value).trim().startsWith("[")
      ? JSON.parse(value)
      : String(value).split(",");
  return times.every((time) =>
    PRODUCT_BEST_TIMES.includes(String(time).trim()),
  );
};

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

const getImageValues = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  const trimmed = String(value).trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  }

  return [trimmed];
};

const validImageUrls = (value) => getImageValues(value).every(isHttpImageUrl);

const requireProductImages = (req, res, next) => {
  const hasUploadedImage = Array.isArray(req.files) && req.files.length > 0;
  const hasImageUrl =
    getImageValues(req.body.image).some((image) => String(image).trim()) ||
    getImageValues(req.body.images).some((image) => String(image).trim());

  if (hasUploadedImage || hasImageUrl) {
    next();
    return;
  }

  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: [{ field: "images", message: "Exactly 3 images required" }],
  });
};

const productQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minPrice must be positive"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxPrice must be positive"),
  query("category")
    .optional()
    .isIn(PRODUCT_CATEGORIES)
    .withMessage("Invalid category"),
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
  body("category").isIn(PRODUCT_CATEGORIES).withMessage("Invalid category"),
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
  body("image")
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Image must be a valid URL"),
  body("images")
    .optional({ values: "falsy" })
    .custom(validImageUrls)
    .withMessage("Images must be valid URLs"),
  body("description").optional().trim().isLength({ max: 4000 }),
  body("usage").optional().isIn(PRODUCT_USAGES).withMessage("Invalid usage"),
  body("seasons").optional().custom(validSeasons).withMessage("Invalid season"),
  body("bestTime")
    .optional()
    .custom(validBestTimes)
    .withMessage("Invalid best time"),
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
    .isIn(PRODUCT_CATEGORIES)
    .withMessage("Invalid category"),
  body("price")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Price must be positive"),
  body("stock")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Stock must be positive"),
  body("image")
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Image must be a valid URL"),
  body("images")
    .optional({ values: "falsy" })
    .custom(validImageUrls)
    .withMessage("Images must be valid URLs"),
  body("description").optional().trim().isLength({ max: 4000 }),
  body("usage").optional().isIn(PRODUCT_USAGES).withMessage("Invalid usage"),
  body("seasons").optional().custom(validSeasons).withMessage("Invalid season"),
  body("bestTime")
    .optional()
    .custom(validBestTimes)
    .withMessage("Invalid best time"),
];

router.get("/", productQueryValidation, validateRequest, getProducts);
router.get("/low-stock", adminAuth, getLowStockProducts);
router.get("/:id", productIdParam, validateRequest, getProductById);
router.post(
  "/bulk",
  adminAuth,
  body("products")
    .isArray({ min: 1 })
    .withMessage("At least one product row is required"),
  validateRequest,
  bulkCreateProducts,
);
router.post(
  "/",
  adminAuth,
  uploadProductImages,
  requireProductImages,
  createProductValidation,
  validateRequest,
  createProduct,
);
router.put(
  "/:id",
  adminAuth,
  uploadProductImages,
  updateProductValidation,
  validateRequest,
  updateProduct,
);
router.delete(
  "/:id",
  adminAuth,
  productIdParam,
  validateRequest,
  deleteProduct,
);

export default router;
