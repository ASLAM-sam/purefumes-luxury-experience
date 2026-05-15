import express from "express";
import { body, param, query } from "express-validator";
import {
  createPerfumeRequest,
  getPerfumeRequests,
  updatePerfumeRequestStatus,
} from "../controllers/perfumeRequestController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { publicRequestLimiter, uploadLimiter } from "../middlewares/rateLimiter.js";
import { uploadPerfumeRequestImages } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { dateRangeQueryValidation } from "../validators/dateRangeValidators.js";
import {
  PERFUME_REQUEST_BUDGET_OPTIONS,
  PERFUME_REQUEST_SIZE_OPTIONS,
  PERFUME_REQUEST_STATUSES,
} from "../models/PerfumeRequest.js";

const router = express.Router();

const normalizeIndianPhone = (value) =>
  String(value || "")
    .trim()
    .replace(/[\s()-]/g, "");

const isIndianMobileNumber = (value) =>
  /^(?:\+91|91)?[6-9]\d{9}$/.test(normalizeIndianPhone(value));

const requestIdParam = param("id")
  .isMongoId()
  .withMessage("Valid perfume request id is required");

const createPerfumeRequestValidation = [
  body("perfumeName")
    .trim()
    .notEmpty()
    .withMessage("Perfume name or brand name is required")
    .isLength({ max: 180 }),
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ max: 120 }),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .custom(isIndianMobileNumber)
    .withMessage("Phone number must be a valid Indian mobile number"),
  body("preferredSize")
    .optional({ values: "falsy" })
    .isIn(PERFUME_REQUEST_SIZE_OPTIONS)
    .withMessage("Preferred size is invalid"),
  body("budgetRange")
    .optional({ values: "falsy" })
    .isIn(PERFUME_REQUEST_BUDGET_OPTIONS)
    .withMessage("Budget range is invalid"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 2000 }),
];

const listPerfumeRequestsValidation = [
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
    .isIn(PERFUME_REQUEST_STATUSES)
    .withMessage("Invalid perfume request status"),
  ...dateRangeQueryValidation,
];

const updatePerfumeRequestStatusValidation = [
  requestIdParam,
  body("status")
    .isIn(PERFUME_REQUEST_STATUSES)
    .withMessage(
      `Status must be one of: ${PERFUME_REQUEST_STATUSES.join(", ")}`,
    ),
];

router.post(
  "/",
  publicRequestLimiter,
  uploadLimiter,
  uploadPerfumeRequestImages,
  createPerfumeRequestValidation,
  validateRequest,
  createPerfumeRequest,
);
router.get(
  "/",
  adminAuth,
  listPerfumeRequestsValidation,
  validateRequest,
  getPerfumeRequests,
);
router.put(
  "/:id",
  adminAuth,
  updatePerfumeRequestStatusValidation,
  validateRequest,
  updatePerfumeRequestStatus,
);

export default router;
