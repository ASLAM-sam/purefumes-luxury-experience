import env from "../config/env.js";
import logger from "../config/logger.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { getPaymentSettings, getEffectivePaymentMode, updatePaymentMode } from "../services/paymentModeService.js";

const buildPaymentConfig = async () => {
  const keyId = String(env.RAZORPAY_KEY_ID || "").trim();
  const mode = await getEffectivePaymentMode();
  const bypassEnabled = mode === "test";

  if (!keyId && !bypassEnabled) {
    throw new ApiError(500, "Razorpay is not configured on the server.");
  }

  if (bypassEnabled) {
    logger.warn("TEST PAYMENT MODE ENABLED", {
      environment: env.NODE_ENV,
      provider: "test-mode",
    });
  }

  return {
    keyId,
    bypassEnabled,
    mode,
    provider: bypassEnabled ? "test-mode" : "razorpay",
  };
};

export const getRazorpayConfig = asyncHandler(async (_req, res) => {
  const config = await buildPaymentConfig();

  res.json({
    success: true,
    data: config,
  });
});

export const getPaymentModeSettings = asyncHandler(async (_req, res) => {
  const settings = await getPaymentSettings();
  res.json({ success: true, data: settings });
});

export const updatePaymentModeSettings = asyncHandler(async (req, res) => {
  const nextMode = String(req.body.paymentMode || "").trim().toLowerCase();

  if (!["live", "test"].includes(nextMode)) {
    throw new ApiError(422, "paymentMode must be live or test");
  }

  const settings = await updatePaymentMode(nextMode);
  const config = await buildPaymentConfig();

  res.json({
    success: true,
    data: {
      ...settings,
      ...config,
    },
  });
});
