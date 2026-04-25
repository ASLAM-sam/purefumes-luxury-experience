import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";

export const getRazorpayConfig = asyncHandler(async (_req, res) => {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();

  if (!keyId) {
    throw new ApiError(500, "Razorpay is not configured on the server.");
  }

  res.json({
    success: true,
    data: {
      keyId,
    },
  });
});
