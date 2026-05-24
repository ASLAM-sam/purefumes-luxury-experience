import env from "../config/env.js";
import logger from "../config/logger.js";
import { captureException } from "../config/sentry.js";
import { getRequestLogContext, sanitizeUrl } from "../utils/redaction.js";

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${sanitizeUrl(req.originalUrl)}`));
};

const shouldCaptureExpectedError = (statusCode, req) => {
  const path = req.originalUrl || "";

  if (statusCode >= 500) return false;
  if (path.includes("/auth/refresh") && [401, 403].includes(statusCode)) return true;
  if (path.includes("/payments") && statusCode >= 400) return true;

  return false;
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || (error.name === "ValidationError" ? 422 : 500);

  const response = {
    success: false,
    message: error.message || "Internal server error",
    data: null,
  };

  if (error.details) {
    response.errors = error.details;
  }

  if (error.name === "CastError") {
    statusCode = 400;
    response.message = "Invalid resource id";
  }

  if (error.code === 11000) {
    statusCode = 409;
    response.message = "Duplicate value already exists";
    response.errors = Object.keys(error.keyPattern || {});
  }

  if (!env.isProduction) {
    response.stack = error.stack;
  }

  logger.error(error.message || "Unhandled API error", {
    ...getRequestLogContext(req, { statusCode }),
    stack: error.stack,
  });

  if (shouldCaptureExpectedError(statusCode, req)) {
    captureException(error, {
      req,
      tags: {
        statusCode,
        area: req.originalUrl?.includes("/payments") ? "payment" : "auth",
      },
      extra: { statusCode },
    });
  }

  res.status(statusCode).json(response);
};
