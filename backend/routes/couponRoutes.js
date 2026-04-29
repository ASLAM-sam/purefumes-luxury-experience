import { Router } from "express";
import { body, param } from "express-validator";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  listCoupons,
  toggleCouponStatus,
} from "../controllers/couponController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

const couponIdParam = param("id")
  .isMongoId()
  .withMessage("Valid coupon id is required");

const couponFieldValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ max: 60 })
    .withMessage("Coupon code cannot exceed 60 characters"),
  body("discountType")
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be percentage or fixed"),
  body("discountValue")
    .notEmpty()
    .withMessage("Discount value is required")
    .isFloat({ gt: 0 })
    .withMessage("Discount value must be greater than 0"),
  body("minOrderAmount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount cannot be negative"),
  body("maxDiscount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Maximum discount cannot be negative"),
  body("expiryDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body().custom((_, { req }) => {
    const discountType = String(req.body.discountType || "").trim();
    const discountValue = Number(req.body.discountValue);

    if (discountType === "percentage" && discountValue > 100) {
      throw new Error("Percentage discount cannot exceed 100");
    }

    return true;
  }),
];

const applyCouponValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ max: 60 })
    .withMessage("Coupon code cannot exceed 60 characters"),
  body("cartTotal")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("cartTotal must be a valid non-negative number"),
  body("items")
    .optional({ values: "falsy" })
    .isArray({ min: 1 })
    .withMessage("items must be a non-empty array"),
  body("items.*.productId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Valid product id is required"),
  body("items.*.quantity")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.size")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 80 })
    .withMessage("Size cannot exceed 80 characters"),
  body().custom((_, { req }) => {
    const hasItems = Array.isArray(req.body.items) && req.body.items.length > 0;
    const hasCartTotal =
      req.body.cartTotal !== undefined &&
      req.body.cartTotal !== null &&
      String(req.body.cartTotal).trim() !== "";

    if (!hasItems && !hasCartTotal) {
      throw new Error("Provide order items or cartTotal to apply a coupon");
    }

    return true;
  }),
];

router.get("/", adminAuth, listCoupons);
router.post("/", adminAuth, couponFieldValidation, validateRequest, createCoupon);
router.post("/apply", applyCouponValidation, validateRequest, applyCoupon);
router.patch(
  "/:id/toggle",
  adminAuth,
  couponIdParam,
  validateRequest,
  toggleCouponStatus,
);
router.delete(
  "/:id",
  adminAuth,
  couponIdParam,
  validateRequest,
  deleteCoupon,
);

export default router;
