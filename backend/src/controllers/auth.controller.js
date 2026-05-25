import { asyncHandler } from "../../middlewares/errorMiddleware.js";
import {
  forgotPassword,
  getAuthConfig,
  getCurrentUserFromRequest,
  login,
  logout,
  refreshSession,
  resetPassword,
  serializeUser,
  signup,
  verifyEmail,
} from "../services/auth.service.js";

export const getAuthConfigController = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: await getAuthConfig(),
  });
});

export const csrfCompatibilityController = asyncHandler(async (_req, res) => {
  res.set("X-CSRF-Token", "deprecated");
  res.json({
    success: true,
    message: "CSRF bootstrap is deprecated in the stateless auth architecture",
    data: {
      csrfToken: "deprecated",
    },
  });
});

export const getMeController = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user ? serializeUser(req.user) : await getCurrentUserFromRequest(req),
    },
  });
});

const CUSTOMER_AUTH_DISABLED_MESSAGE =
  "Customer accounts have been retired. Customers can now place orders directly at checkout.";

export const signupController = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: await signup({ payload: req.body, req, res }),
    },
  });
});

export const customerAuthDisabledController = asyncHandler(async (_req, res) => {
  res.status(410).json({
    success: false,
    message: CUSTOMER_AUTH_DISABLED_MESSAGE,
    data: null,
  });
});

export const loginController = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: await login({
        identifier: req.body.identifier || req.body.email || req.body.mobile,
        password: req.body.password,
        req,
        res,
      }),
    },
  });
});

export const refreshController = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Authentication refreshed",
    data: {
      user: await refreshSession({ req, res }),
    },
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  await logout({ req, res });
  res.json({
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  await forgotPassword({
    email: String(req.body.email || "").trim().toLowerCase(),
  });
  res.json({
    success: true,
    message: "If the account exists, a password reset link has been sent",
    data: null,
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  await resetPassword({
    token: String(req.body.token || ""),
    password: String(req.body.password || ""),
    res,
  });
  res.json({
    success: true,
    message: "Password reset successfully",
    data: null,
  });
});

export const verifyEmailController = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Email verified successfully",
    data: {
      user: await verifyEmail({
        token: String(req.body.token || ""),
        req,
        res,
      }),
    },
  });
});

export const disabledGoogleOAuthController = asyncHandler(async (_req, res) => {
  res.status(410).json({
    success: false,
    message: CUSTOMER_AUTH_DISABLED_MESSAGE,
    data: { google: await getAuthConfig() },
  });
});
