import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createPerfumeRequest,
  getPerfumeRequests,
  updatePerfumeRequestStatus,
} from "../controllers/perfumeRequestController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { uploadPerfumeRequestImages } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  PERFUME_REQUEST_BUDGET_OPTIONS,
  PERFUME_REQUEST_SIZE_OPTIONS,
  PERFUME_REQUEST_STATUSES,
} from "../models/PerfumeRequest.js";

const router = Router();

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
  query("status")
    .optional()
    .isIn(PERFUME_REQUEST_STATUSES)
    .withMessage("Invalid perfume request status"),
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
