import Coupon from "../models/Coupon.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

const roundCurrency = (value) =>
  Math.max(0, Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100);

export const normalizeCouponCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

export const serializeCoupon = (coupon) => {
  const raw =
    typeof coupon?.toObject === "function"
      ? coupon.toObject({ virtuals: true })
      : coupon;

  if (!raw) return null;

  return {
    _id: raw._id?.toString?.() || raw._id,
    id: raw.id || raw._id?.toString?.() || raw._id,
    code: raw.code || "",
    discountType: raw.discountType,
    discountValue: Number(raw.discountValue || 0),
    minOrderAmount: Number(raw.minOrderAmount || 0),
    maxDiscount:
      raw.maxDiscount === null || raw.maxDiscount === undefined
        ? null
        : Number(raw.maxDiscount || 0),
    expiryDate: raw.expiryDate ? new Date(raw.expiryDate).toISOString() : null,
    isActive: Boolean(raw.isActive),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : "",
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : "",
  };
};

export const calculateCouponDiscount = (coupon, subtotalAmount) => {
  const subtotal = roundCurrency(subtotalAmount);
  let discount =
    coupon.discountType === "percentage"
      ? (subtotal * Number(coupon.discountValue || 0)) / 100
      : Number(coupon.discountValue || 0);

  if (coupon.discountType === "percentage" && coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
    discount = Math.min(discount, Number(coupon.maxDiscount || 0));
  }

  discount = roundCurrency(Math.min(discount, subtotal));

  return {
    subtotal,
    discount,
    finalTotal: roundCurrency(subtotal - discount),
  };
};

export const validateCouponForSubtotal = (coupon, subtotalAmount) => {
  const subtotal = roundCurrency(subtotalAmount);

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new ApiError(400, "This coupon is currently inactive");
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
    throw new ApiError(400, "This coupon has expired");
  }

  if (subtotal < Number(coupon.minOrderAmount || 0)) {
    throw new ApiError(
      400,
      `Minimum order amount of Rs. ${Number(coupon.minOrderAmount || 0).toLocaleString("en-IN")} is required for this coupon`,
    );
  }

  return subtotal;
};

export const applyCouponToSubtotal = async ({ code, subtotalAmount }) => {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    throw new ApiError(400, "Coupon code is required");
  }

  const coupon = await Coupon.findOne({ code: normalizedCode });
  const subtotal = validateCouponForSubtotal(coupon, subtotalAmount);
  const totals = calculateCouponDiscount(coupon, subtotal);

  return {
    coupon,
    code: normalizedCode,
    ...totals,
  };
};
