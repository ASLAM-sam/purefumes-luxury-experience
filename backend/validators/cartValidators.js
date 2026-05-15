import { body, param } from "express-validator";

export const cartItemValidation = [
  body("productId").optional().isMongoId().withMessage("Valid product id is required"),
  body("itemId").optional().isMongoId().withMessage("Valid cart item id is required"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("size").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("selectedVariant.size").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body().custom((_, { req }) => {
    if (req.body.productId || req.body.itemId) return true;
    throw new Error("productId or itemId is required");
  }),
];

export const cartSyncValidation = [
  body("items").optional().isArray({ max: 100 }),
  body("items.*.productId").isMongoId().withMessage("Valid product id is required"),
  body("items.*.quantity").optional().isInt({ min: 1 }),
  body("items.*.size").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
];

export const cartProductParamValidation = [
  param("id").isMongoId().withMessage("Valid cart item id is required"),
];
