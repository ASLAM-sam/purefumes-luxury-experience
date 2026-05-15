import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import {
  applyCouponToSubtotal,
  normalizeCouponCode,
  serializeCoupon,
} from "../services/couponService.js";
import { buildPreparedOrderItems, normalizeOrderItems } from "../services/pricingService.js";

const getSubtotalAmountFromRequest = async (body) => {
  const items = normalizeOrderItems(body);

  if (items.length > 0) {
    const { subtotalAmount } = await buildPreparedOrderItems(items);
    return subtotalAmount;
  }

  const cartTotal = Number(body.cartTotal);

  if (!Number.isFinite(cartTotal) || cartTotal < 0) {
    throw new ApiError(400, "A valid cart total or order items are required");
  }

  return cartTotal;
};

const buildCouponResponse = (coupon) => serializeCoupon(coupon);

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: coupons.map(buildCouponResponse),
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({
    code: normalizeCouponCode(req.body.code),
    discountType: req.body.discountType,
    discountValue: Number(req.body.discountValue),
    minOrderAmount: Number(req.body.minOrderAmount || 0),
    maxDiscount:
      req.body.maxDiscount === undefined ||
      req.body.maxDiscount === null ||
      req.body.maxDiscount === ""
        ? null
        : Number(req.body.maxDiscount),
    expiryDate: req.body.expiryDate || null,
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
  });

  res.status(201).json({
    success: true,
    data: buildCouponResponse(coupon),
  });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid coupon id");
  }

  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.json({
    success: true,
    data: { id: req.params.id },
  });
});

export const toggleCouponStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid coupon id");
  }

  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.json({
    success: true,
    data: buildCouponResponse(coupon),
  });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const subtotalAmount = await getSubtotalAmountFromRequest(req.body);
  const result = await applyCouponToSubtotal({
    code: req.body.code,
    subtotalAmount,
  });

  res.json({
    success: true,
    code: result.code,
    discount: result.discount,
    finalTotal: result.finalTotal,
    subtotal: result.subtotal,
    message: "Coupon applied successfully",
    coupon: buildCouponResponse(result.coupon),
  });
});
