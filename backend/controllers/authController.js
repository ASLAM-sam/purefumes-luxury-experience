import env from "../config/env.js";
import logger from "../config/logger.js";
import { getGoogleOAuthConfigStatus } from "../config/passport.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";
import {
  forgotPassword,
  login,
  loginWithGoogle,
  logout,
  refreshSession,
  resetPassword,
  signup,
  verifyEmail,
} from "../services/auth/authService.js";
import { getUserProfile } from "../services/user/userService.js";
import { setCsrfCookie } from "../middlewares/securityMiddleware.js";

const sanitizeRedirectPath = (value, fallback = "/") => {
  const redirectPath = String(value || fallback).trim();
  return redirectPath.startsWith("/") && !redirectPath.startsWith("//") ? redirectPath : fallback;
};

const clearOAuthRedirect = (req) => {
  if (req.session?.oauthRedirect) {
    delete req.session.oauthRedirect;
  }
};

const buildFrontendRedirect = (path, params = {}) => {
  const url = new URL(path, env.FRONTEND_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
};

export const signupUser = asyncHandler(async (req, res) => {
  const user = await signup({ payload: req.body, req, res });
  res.status(201).json({ success: true, data: { user } });
});

export const loginUser = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier || req.body.email || req.body.mobile;
  const user = await login({ identifier, password: req.body.password, req, res });
  res.json({ success: true, data: { user } });
});

export const logoutUser = asyncHandler(async (req, res) => {
  await logout({ req, res });

  if (typeof req.logout === "function") {
    await new Promise((resolve, reject) => {
      req.logout((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  if (req.session) {
    await new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  logger.info("User logout completed", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
  });

  if (req.method === "GET") {
    return res.redirect(buildFrontendRedirect("/login", { logout: "success" }).toString());
  }

  return res.json({ success: true, data: { message: "Logged out" } });
});

export const refreshUserSession = asyncHandler(async (req, res) => {
  const user = await refreshSession({ req, res });
  res.json({ success: true, data: { user } });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: await getUserProfile(req.user) } });
});

export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  await forgotPassword({ email: req.body.email });
  res.json({
    success: true,
    data: {
      message: "If an account exists, a password reset email has been sent.",
    },
  });
});

export const resetPasswordRequest = asyncHandler(async (req, res) => {
  await resetPassword({ token: req.body.token, password: req.body.password });
  res.json({ success: true, data: { message: "Password reset successfully" } });
});

export const verifyEmailRequest = asyncHandler(async (req, res) => {
  const user = await verifyEmail({ token: req.body.token });
  res.json({ success: true, data: { user } });
});

export const csrfToken = asyncHandler(async (_req, res) => {
  const token = setCsrfCookie(res);
  res.json({ success: true, data: { csrfToken: token } });
});

export const getAuthConfig = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      google: getGoogleOAuthConfigStatus(),
    },
  });
});

export const googleOAuthCallback = asyncHandler(async (req, res) => {
  logger.info("Google OAuth callback hit", {
    requestId: req.id,
    path: req.originalUrl,
    hasCode: Boolean(req.query.code),
    hasIss: Boolean(req.query.iss),
    providerError: req.query.error || "",
  });

  if (req.query.error) {
    logger.warn("Google OAuth provider returned an error", {
      requestId: req.id,
      error: req.query.error,
      description: req.query.error_description || "",
    });
    clearOAuthRedirect(req);
    return res.redirect(
      buildFrontendRedirect("/login", {
        error: "google_oauth",
        message: req.query.error_description || "Google sign-in was cancelled or denied.",
      }).toString(),
    );
  }

  try {
    const { user } = await loginWithGoogle({ profile: req.user, req, res });
    const safeRedirectPath = sanitizeRedirectPath(req.session?.oauthRedirect, "/profile");

    clearOAuthRedirect(req);

    const redirectUrl = buildFrontendRedirect("/login/success", {
      redirect: safeRedirectPath,
      auth: "google",
    });

    logger.info("Google OAuth login completed", {
      requestId: req.id,
      userId: user?.id || "",
      email: user?.email || "",
      redirectPath: safeRedirectPath,
    });

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error("Google OAuth callback processing failed", {
      requestId: req.id,
      error: error.message,
      stack: error.stack,
    });
    clearOAuthRedirect(req);
    return res.redirect(
      buildFrontendRedirect("/login", {
        error: "google_oauth",
        message: error.message || "Google sign-in failed.",
      }).toString(),
    );
  }
});

export const googleOAuthFailure = asyncHandler(async (req, res) => {
  logger.warn("Google OAuth authentication failed", {
    requestId: req.id,
    path: req.originalUrl,
    redirect: req.query.redirect || "",
    error: req.query.error || "",
  });

  clearOAuthRedirect(req);

  const safeRedirectPath = sanitizeRedirectPath(req.query.redirect, "/login");
  const redirectUrl = buildFrontendRedirect(safeRedirectPath, {
    error: "google_oauth",
    message: req.query.message || "Google sign-in could not be completed.",
  });
  res.redirect(redirectUrl.toString());
});
