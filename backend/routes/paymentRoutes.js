import express from "express";
import { body } from "express-validator";
import { adminAuth } from "../middlewares/authMiddleware.js";
import {
  createRazorpayOrder,
  getPaymentModeSettings,
  getRazorpayConfig,
  updatePaymentModeSettings,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";
import { orderLimiter } from "../middlewares/rateLimiter.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();
export const checkoutPaymentRoutes = express.Router();

const createRazorpayOrderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one checkout item is required"),
  body("items.*.productId")
    .isMongoId()
    .withMessage("Valid product id is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.size")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 80 }),
  body("couponCode")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 60 })
    .withMessage("Coupon code cannot exceed 60 characters"),
  body("currency")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),
  body("receipt")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 40 })
    .withMessage("Receipt cannot exceed 40 characters"),
];

const verifyRazorpayPaymentValidation = [
  body("razorpay_payment_id")
    .trim()
    .notEmpty()
    .withMessage("Razorpay payment id is required")
    .isLength({ max: 200 })
    .withMessage("Razorpay payment id is too long"),
  body("razorpay_order_id")
    .trim()
    .notEmpty()
    .withMessage("Razorpay order id is required")
    .isLength({ max: 200 })
    .withMessage("Razorpay order id is too long"),
  body("razorpay_signature")
    .trim()
    .notEmpty()
    .withMessage("Razorpay signature is required")
    .isLength({ max: 300 })
    .withMessage("Razorpay signature is too long"),
];

router.get("/razorpay/config", getRazorpayConfig);

checkoutPaymentRoutes.post(
  "/create-order",
  orderLimiter,
  createRazorpayOrderValidation,
  validateRequest,
  createRazorpayOrder,
);
checkoutPaymentRoutes.post(
  "/verify-payment",
  orderLimiter,
  verifyRazorpayPaymentValidation,
  validateRequest,
  verifyRazorpayPayment,
);

router.use(checkoutPaymentRoutes);
router.get("/settings", adminAuth, getPaymentModeSettings);
router.put(
  "/settings",
  adminAuth,
  [
    body("paymentMode")
      .trim()
      .isIn(["live", "test"])
      .withMessage("paymentMode must be live or test"),
  ],
  validateRequest,
  updatePaymentModeSettings,
);

export default router;
