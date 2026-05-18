import { body, param, query } from "express-validator";

export const categoryIdParamValidation = [
  param("id").isMongoId().withMessage("Valid category id is required"),
];

export const categoryCreateValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 80 })
    .withMessage("Category name cannot exceed 80 characters"),
  body("slug").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  body("image").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
  body("icon").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  body("color")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^#?[0-9a-fA-F]{6}$/)
    .withMessage("Category color must be a valid hex color"),
  body("sortOrder").optional({ values: "falsy" }).isInt({ min: 0 }),
  body("displayOrder").optional({ values: "falsy" }).isInt({ min: 0 }),
  body("featured").optional().isBoolean().withMessage("featured must be a boolean"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  body("active").optional().isBoolean().withMessage("active must be a boolean"),
];

export const categoryUpdateValidation = [
  ...categoryIdParamValidation,
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("slug").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  body("image").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
  body("icon").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  body("color")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^#?[0-9a-fA-F]{6}$/)
    .withMessage("Category color must be a valid hex color"),
  body("sortOrder").optional({ values: "falsy" }).isInt({ min: 0 }),
  body("displayOrder").optional({ values: "falsy" }).isInt({ min: 0 }),
  body("featured").optional().isBoolean().withMessage("featured must be a boolean"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  body("active").optional().isBoolean().withMessage("active must be a boolean"),
];

export const categoryListValidation = [
  query("featured").optional().isIn(["true", "false"]),
  query("search").optional().trim().isLength({ max: 160 }),
];

export const adminCategoryListValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().trim().isLength({ max: 160 }),
  query("featured").optional().isIn(["featured", "standard"]),
  query("state").optional().isIn(["active", "inactive", "deleted"]),
];

export const categoryReorderValidation = [
  body("items").isArray({ min: 1 }).withMessage("items must contain at least one category"),
];
