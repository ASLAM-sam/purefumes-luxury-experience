import express from "express";
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
import {
  PRODUCT_CATEGORIES,
} from "../models/Product.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { adminLimiter, uploadLimiter } from "../middlewares/rateLimiter.js";
import { uploadProductImages } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

const productIdParam = param("id")
  .isMongoId()
  .withMessage("Valid product id is required");

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
    getImageValues(req.body.images).some((image) => String(image).trim()) ||
    ["image1", "image2", "image3", "image4", "image5"].some((field) =>
      getImageValues(req.body[field]).some((image) => String(image).trim()),
    );

  if (hasUploadedImage || hasImageUrl) {
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
  body(["image1", "image2", "image3", "image4", "image5"])
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Image must be a valid URL"),
  body("images")
    .optional({ values: "falsy" })
    .custom(validImageUrls)
    .withMessage("Images must be valid URLs"),
  body("videoUrl")
    .optional({ values: "falsy" })
    .trim()
    .matches(/\.(mp4|webm|mov)(\?.*)?$/i)
    .withMessage("Video URL must point to an mp4, webm, or mov file"),
  body("isLatest")
    .optional()
    .isBoolean()
    .withMessage("isLatest must be a boolean"),
  body("description").optional().trim().isLength({ max: 4000 }),
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
  body(["image1", "image2", "image3", "image4", "image5"])
    .optional({ values: "falsy" })
    .trim()
    .custom(isHttpImageUrl)
    .withMessage("Image must be a valid URL"),
  body("images")
    .optional({ values: "falsy" })
    .custom(validImageUrls)
    .withMessage("Images must be valid URLs"),
  body("videoUrl")
    .optional({ values: "falsy" })
    .trim()
    .matches(/\.(mp4|webm|mov)(\?.*)?$/i)
    .withMessage("Video URL must point to an mp4, webm, or mov file"),
  body("isLatest")
    .optional()
    .isBoolean()
    .withMessage("isLatest must be a boolean"),
  body("description").optional().trim().isLength({ max: 4000 }),
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
  body("products.*.description").optional({ values: "falsy" }).trim().isLength({ max: 4000 }),
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
