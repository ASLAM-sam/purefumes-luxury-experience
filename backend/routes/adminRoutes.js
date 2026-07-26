import express from "express";
import { body, param, query } from "express-validator";
import {
  banUser,
  cancelAdminBackInStockNotification,
  clearAdminActivity,
  clearAdminAnalytics,
  clearAdminOrders,
  clearAdminUsers,
  deleteUser,
  getAdminBackInStockNotifications,
  getAdminAnalytics,
  getAdminOrders,
  getAdminUserDetails,
  getAdminUserOrders,
  getAdminUsers,
  patchOrderStatus,
  retryAdminBackInStockNotification,
} from "../controllers/adminController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { ORDER_STATUSES } from "../models/Order.js";
import { BACK_IN_STOCK_NOTIFICATION_STATUSES } from "../models/BackInStockNotification.js";
import { dateRangeQueryValidation } from "../validators/dateRangeValidators.js";

const router = express.Router();

router.use(adminAuth);

router.get(
  "/users",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["active", "blocked", "verified", "unverified"]),
    query("search").optional().trim().isLength({ max: 160 }),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "updatedAt", "lastLogin", "name", "email", "username", "mobile", "totalOrders", "totalSpent"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  validateRequest,
  getAdminUsers,
);

router.get(
  "/orders",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(ORDER_STATUSES),
    query("search").optional({ values: "falsy" }).trim().isLength({ max: 160 }),
    ...dateRangeQueryValidation,
  ],
  validateRequest,
  getAdminOrders,
);
router.get(
  "/back-in-stock-notifications",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional({ values: "falsy" }).isIn(BACK_IN_STOCK_NOTIFICATION_STATUSES),
    query("search").optional({ values: "falsy" }).trim().isLength({ max: 160 }),
  ],
  validateRequest,
  getAdminBackInStockNotifications,
);
router.post(
  "/back-in-stock-notifications/:id/retry",
  [param("id").isMongoId().withMessage("Valid notification id is required")],
  validateRequest,
  retryAdminBackInStockNotification,
);
router.patch(
  "/back-in-stock-notifications/:id/cancel",
  [param("id").isMongoId().withMessage("Valid notification id is required")],
  validateRequest,
  cancelAdminBackInStockNotification,
);
router.get(
  "/analytics",
  [
    ...dateRangeQueryValidation,
  ],
  validateRequest,
  getAdminAnalytics,
);

router.delete("/analytics/clear-test-data", clearAdminAnalytics);
router.delete("/analytics/activity", clearAdminActivity);
router.delete("/analytics", clearAdminAnalytics);
router.delete("/orders", clearAdminOrders);
router.delete("/users", clearAdminUsers);

router.patch(
  "/order-status/:id",
  [
    param("id").isMongoId().withMessage("Valid order id is required"),
    body("status").isIn(ORDER_STATUSES).withMessage("Invalid order status"),
    body("trackingId").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
    body("deliveryDate").optional({ values: "falsy" }).isISO8601(),
  ],
  validateRequest,
  patchOrderStatus,
);

router.patch(
  "/ban-user/:id",
  [
    param("id").isMongoId().withMessage("Valid user id is required"),
    body("isBanned").optional().isBoolean(),
  ],
  validateRequest,
  banUser,
);

router.get(
  "/user/:id",
  [param("id").isMongoId().withMessage("Valid user id is required")],
  validateRequest,
  getAdminUserDetails,
);

router.get(
  "/user/:id/orders",
  [
    param("id").isMongoId().withMessage("Valid user id is required"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  getAdminUserOrders,
);

router.delete(
  "/user/:id",
  [param("id").isMongoId().withMessage("Valid user id is required")],
  validateRequest,
  deleteUser,
);

export default router;
