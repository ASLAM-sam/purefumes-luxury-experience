import express from "express";
import {
  customerAuthDisabledController,
  csrfCompatibilityController,
  disabledGoogleOAuthController,
  getAuthConfigController,
  getMeController,
  loginController,
  logoutController,
  refreshController,
} from "../controllers/auth.controller.js";
import { adminAuth } from "../middlewares/authentication.js";
import {
  authLimiter,
  failedLoginLimiter,
} from "../../middlewares/rateLimiter.js";
import { loginValidation } from "../../validators/authValidators.js";
import { validateRequest } from "../../middlewares/validateRequest.js";

const router = express.Router();

router.get("/config", getAuthConfigController);
router.get("/csrf-token", csrfCompatibilityController);
router.get("/me", adminAuth, getMeController);

router.post("/login", failedLoginLimiter, loginValidation, validateRequest, loginController);
router.post("/logout", logoutController);
router.post("/refresh", refreshController);

router.post("/signup", authLimiter, customerAuthDisabledController);
router.post("/forgot-password", authLimiter, customerAuthDisabledController);
router.post("/reset-password", authLimiter, customerAuthDisabledController);
router.post("/verify-email", authLimiter, customerAuthDisabledController);
router.get("/google", authLimiter, disabledGoogleOAuthController);
router.get("/google/callback", authLimiter, disabledGoogleOAuthController);
router.get("/google/failure", authLimiter, disabledGoogleOAuthController);

export default router;
