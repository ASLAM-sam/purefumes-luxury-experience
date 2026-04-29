import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getOrders,
  getUnseenOrders,
  markOrderSeen,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { ORDER_STATUSES } from "../models/Order.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

const orderIdParam = param("id")
  .isMongoId()
  .withMessage("Valid order id is required");

const createOrderValidation = [
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ max: 120 }),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9+\-\s()]{7,25}$/)
    .withMessage("Phone number is invalid"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 1000 }),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one order item is required"),
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
  body("paymentId").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("paymentMethod").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("paymentGateway").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("paymentOrderId").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("paymentSignature").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
];

const listOrdersValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(ORDER_STATUSES)
    .withMessage("Invalid order status"),
];

const updateStatusValidation = [
  orderIdParam,
  body("status")
    .isIn(ORDER_STATUSES)
    .withMessage(`Status must be one of: ${ORDER_STATUSES.join(", ")}`),
];

router.post("/", createOrderValidation, validateRequest, placeOrder);
router.get("/unseen", adminAuth, getUnseenOrders);
router.get("/", adminAuth, listOrdersValidation, validateRequest, getOrders);
router.put(
  "/:id/seen",
  adminAuth,
  orderIdParam,
  validateRequest,
  markOrderSeen,
);
router.put(
  "/:id",
  adminAuth,
  updateStatusValidation,
  validateRequest,
  updateOrderStatus,
);

export default router;
