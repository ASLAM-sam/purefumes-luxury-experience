import crypto from "crypto";
import Razorpay from "razorpay";
import env from "../config/env.js";
import logger from "../config/logger.js";
import { captureException } from "../config/sentry.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { normalizeMoney, toPaise } from "../utils/money.js";
import { applyCouponToPreparedItems } from "./couponService.js";
import { buildPreparedOrderItems } from "./pricingService.js";

let cachedClient = null;
let cachedKeyId = "";
let cachedKeySecret = "";
const SHIPPING_THRESHOLD = 2499;
const SHIPPING_CHARGE = 100;

const calculateShippingCharge = (subtotalAfterDiscount) =>
  normalizeMoney(subtotalAfterDiscount) <= SHIPPING_THRESHOLD ? SHIPPING_CHARGE : 0;

const getCredentials = () => {
  const keyId = String(env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new ApiError(500, "Razorpay credentials are not configured.");
  }

  return { keyId, keySecret };
};

const getRazorpayClient = () => {
  const { keyId, keySecret } = getCredentials();

  if (cachedClient && cachedKeyId === keyId && cachedKeySecret === keySecret) {
    return cachedClient;
  }

  cachedClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  cachedKeyId = keyId;
  cachedKeySecret = keySecret;

  return cachedClient;
};

const normalizeCurrency = (currency) => {
  const normalized = String(currency || "INR")
    .trim()
    .toUpperCase();
  return normalized || "INR";
};

const buildReceipt = (receipt, userId) => {
  const requestedReceipt = String(receipt || "").trim();
  if (requestedReceipt) return requestedReceipt.slice(0, 40);

  const suffix = String(userId || "guest")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8);
  return `pf_${Date.now()}_${suffix}`.slice(0, 40);
};

export const buildCheckoutTotals = async ({ items, couponCode }) => {
  const { preparedItems, subtotalAmount } = await buildPreparedOrderItems(
    items,
    {
      requireAvailableStock: true,
    },
  );

  let discountAmount = 0;
  let totalAmount = normalizeMoney(subtotalAmount);
  let appliedCouponCode = "";

  if (String(couponCode || "").trim()) {
    const couponResult = await applyCouponToPreparedItems({
      code: couponCode,
      preparedItems,
    });

    appliedCouponCode = couponResult.code;
    discountAmount = normalizeMoney(couponResult.discount);
    totalAmount = normalizeMoney(couponResult.finalTotal);
  }

  const shippingCharge = calculateShippingCharge(totalAmount);
  totalAmount = normalizeMoney(totalAmount + shippingCharge);
  const amount = toPaise(totalAmount);

  if (!Number.isInteger(amount) || amount < 100) {
    throw new ApiError(400, "Order amount must be at least ₹1.");
  }

  return {
    preparedItems,
    subtotalAmount,
    discountAmount,
    shippingCharge,
    totalAmount,
    couponCode: appliedCouponCode,
    amount,
  };
};

export const createRazorpayCheckoutOrder = async ({
  items,
  couponCode,
  currency,
  receipt,
  userId,
}) => {
  const totals = await buildCheckoutTotals({ items, couponCode });
  const normalizedCurrency = normalizeCurrency(currency);
  const orderReceipt = buildReceipt(receipt, userId);

  try {
    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: totals.amount,
      currency: normalizedCurrency,
      receipt: orderReceipt,
      notes: {
        userId: String(userId || ""),
        couponCode: totals.couponCode,
      },
    });

    return {
      order_id: order.id,
      amount: Number(order.amount),
      currency: order.currency || normalizedCurrency,
      receipt: order.receipt || orderReceipt,
      subtotalAmount: totals.subtotalAmount,
      discountAmount: totals.discountAmount,
      shippingCharge: totals.shippingCharge,
      totalAmount: totals.totalAmount,
      couponCode: totals.couponCode,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const statusCode = Number(
      error?.statusCode || error?.status || error?.error?.status_code || 500,
    );
    const razorpayMessage =
      error?.error?.description ||
      error?.message ||
      "Razorpay order could not be created.";

    logger.error("Razorpay order creation failed", {
      statusCode,
      message: razorpayMessage,
    });
    captureException(new Error("Razorpay order creation failed"), {
      tags: { area: "payment", provider: "razorpay", action: "create_order" },
      extra: { statusCode, providerMessage: razorpayMessage },
    });

    if (statusCode === 401) {
      throw new ApiError(
        401,
        "Razorpay authentication failed. Check the key id and secret.",
      );
    }

    throw new ApiError(500, "Razorpay order could not be created.");
  }
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const normalizedOrderId = String(orderId || "").trim();
  const normalizedPaymentId = String(paymentId || "").trim();
  const normalizedSignature = String(signature || "").trim();

  if (!normalizedOrderId || !normalizedPaymentId || !normalizedSignature) {
    throw new ApiError(400, "Payment verification fields are required.");
  }

  const { keySecret } = getCredentials();
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${normalizedOrderId}|${normalizedPaymentId}`)
    .digest("hex");

  if (expectedSignature.length !== normalizedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(normalizedSignature),
  );
};

export const fetchRazorpayOrder = async (orderId) => {
  const normalizedOrderId = String(orderId || "").trim();

  if (!normalizedOrderId) {
    throw new ApiError(400, "Razorpay order id is required.");
  }

  try {
    const client = getRazorpayClient();
    return await client.orders.fetch(normalizedOrderId);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const statusCode = Number(
      error?.statusCode || error?.status || error?.error?.status_code || 500,
    );
    const razorpayMessage =
      error?.error?.description ||
      error?.message ||
      "Razorpay order could not be fetched.";

    logger.error("Razorpay order fetch failed", {
      statusCode,
      message: razorpayMessage,
    });
    captureException(new Error("Razorpay order fetch failed"), {
      tags: { area: "payment", provider: "razorpay", action: "fetch_order" },
      extra: { statusCode, providerMessage: razorpayMessage },
    });

    if (statusCode === 401) {
      throw new ApiError(
        401,
        "Razorpay authentication failed. Check the key id and secret.",
      );
    }

    throw new ApiError(500, "Razorpay order could not be verified.");
  }
};

export const verifyRazorpayOrderAmount = async ({
  orderId,
  expectedAmount,
}) => {
  const order = await fetchRazorpayOrder(orderId);
  return Number(order?.amount) === toPaise(expectedAmount);
};
