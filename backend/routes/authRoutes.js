import express from "express";
import passport, { getGoogleOAuthConfigStatus, isGoogleOAuthConfigured } from "../config/passport.js";
import logger from "../config/logger.js";
import {
  csrfToken,
  forgotPasswordRequest,
  getAuthConfig,
  getMe,
  googleOAuthCallback,
  googleOAuthFailure,
  loginUser,
  logoutUser,
  refreshUserSession,
  resetPasswordRequest,
  signupUser,
  verifyEmailRequest,
} from "../controllers/authController.js";
import { adminAuth, requireAuth } from "../middlewares/authMiddleware.js";
import {
  authLimiter,
  failedLoginLimiter,
  forgotPasswordLimiter,
  signupLimiter,
} from "../middlewares/rateLimiter.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  forgotPasswordValidation,
  loginValidation,
  resetPasswordValidation,
  signupValidation,
  verifyEmailValidation,
} from "../validators/authValidators.js";

const router = express.Router();

const ensureGoogleOAuthConfigured = (_req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      success: false,
      message: "Google OAuth is not configured.",
      data: {
        google: getGoogleOAuthConfigStatus(),
      },
    });
  }

  return next();
};

router.get("/config", getAuthConfig);
router.get("/csrf-token", csrfToken);
router.get("/me", requireAuth, getMe);

router.post("/signup", signupLimiter, signupValidation, validateRequest, signupUser);
router.post("/login", failedLoginLimiter, loginValidation, validateRequest, loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshUserSession);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordValidation,
  validateRequest,
  forgotPasswordRequest,
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  validateRequest,
  resetPasswordRequest,
);
router.post(
  "/verify-email",
  authLimiter,
  verifyEmailValidation,
  validateRequest,
  verifyEmailRequest,
);

// Test email route for SMTP debugging
router.post("/test-email", adminAuth, async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email address is required",
      });
    }

    // Import sendTemplatedEmail dynamically to avoid circular imports
    const { sendTemplatedEmail } = await import("../services/email/emailService.js");

    // Send a simple test email
    const info = await sendTemplatedEmail({
      to,
      template: "testEmail",
      subject: "Brevo SMTP Test",
      data: {
        message: "SMTP working correctly",
        timestamp: new Date().toISOString(),
      },
    });

    res.json({
      success: true,
      message: "Test email sent successfully",
      data: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    });
  } catch (error) {
    logger.error("Test email failed", { error: error.message, to: req.body.to });
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

router.get("/google", authLimiter, ensureGoogleOAuthConfigured, (req, res, next) => {
  const redirect = String(req.query.redirect || "/");
  const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";

  if (req.session) {
    req.session.oauthRedirect = safeRedirect;
  }

  logger.info("Redirecting user to Google OAuth", {
    requestId: req.id,
    redirectPath: req.session?.oauthRedirect || safeRedirect,
  });

  const startOAuth = () =>
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      state: true,
    })(req, res, next);

  if (!req.session) {
    return startOAuth();
  }

  return req.session.save((error) => {
    if (error) {
      logger.error("Failed to persist Google OAuth session before redirect", {
        requestId: req.id,
        error: error.message,
      });
      return res.redirect(
        "/auth/google/failure?message=Unable%20to%20start%20Google%20sign-in.",
      );
    }

    return startOAuth();
  });
});

router.get("/google/failure", googleOAuthFailure);

router.get(
  "/google/callback",
  authLimiter,
  ensureGoogleOAuthConfigured,
  (req, res, next) => {
    if (!req.query.code && !req.query.error) {
      logger.warn("Invalid Google OAuth callback received without authorization code", {
        requestId: req.id,
        query: req.query,
      });
      return res.redirect("/auth/google/failure?message=Invalid%20Google%20OAuth%20callback.");
    }

    passport.authenticate(
      "google",
      {
        session: false,
        failureRedirect: "/auth/google/failure",
      },
      (error, user, info) => {
        if (error) {
          logger.error("Google OAuth authentication errored", {
            requestId: req.id,
            error: error.message,
            stack: error.stack,
          });
          return res.redirect("/auth/google/failure?message=Google%20sign-in%20failed.");
        }

        if (!user) {
          logger.warn("Google OAuth authentication returned no user", {
            requestId: req.id,
            info,
          });
          return res.redirect("/auth/google/failure?message=Google%20account%20validation%20failed.");
        }

        req.user = user;
        return googleOAuthCallback(req, res, next);
      },
    )(req, res, next);
  },
);

export default router;
