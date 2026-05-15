import env from "../config/env.js";
import logger from "../config/logger.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";

export const getRazorpayConfig = asyncHandler(async (_req, res) => {
  const keyId = String(env.RAZORPAY_KEY_ID || "").trim();
  const bypassEnabled = Boolean(env.PAYMENT_BYPASS_ENABLED);

  if (!keyId && !bypassEnabled) {
    throw new ApiError(500, "Razorpay is not configured on the server.");
  }

  if (bypassEnabled) {
    logger.warn("PAYMENT BYPASS MODE ENABLED", {
      environment: env.NODE_ENV,
      provider: "development-bypass",
    });
  }

  res.json({
    success: true,
    data: {
      keyId,
      bypassEnabled,
      provider: bypassEnabled ? "development-bypass" : "razorpay",
    },
  });
});
