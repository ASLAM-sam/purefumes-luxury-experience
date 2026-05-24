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
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  body("image").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

export const categoryUpdateValidation = [
  ...categoryIdParamValidation,
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  body("image").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

export const categoryListValidation = [
  query("search").optional().trim().isLength({ max: 160 }),
];

export const adminCategoryListValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().trim().isLength({ max: 160 }),
];
