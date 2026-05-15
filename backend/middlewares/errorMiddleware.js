import env from "../config/env.js";
import logger from "../config/logger.js";

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
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  let statusCode = error.statusCode || (error.name === "ValidationError" ? 422 : 500);

  const response = {
    success: false,
    message: error.message || "Internal server error",
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
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    stack: error.stack,
  });

  res.status(statusCode).json(response);
};
