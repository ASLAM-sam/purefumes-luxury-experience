import express from "express";
import { body } from "express-validator";
import { adminAuth } from "../middlewares/authMiddleware.js";
import {
  getPaymentModeSettings,
  getRazorpayConfig,
  updatePaymentModeSettings,
} from "../controllers/paymentController.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

router.get("/razorpay/config", getRazorpayConfig);
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
