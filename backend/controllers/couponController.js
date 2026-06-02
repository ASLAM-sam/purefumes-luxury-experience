import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import {
  applyCouponToPreparedItems,
  applyCouponToSubtotal,
  normalizeCouponCode,
  serializeCoupon,
} from "../services/couponService.js";
import {
  buildPreparedOrderItems,
  normalizeOrderItems,
} from "../services/pricingService.js";
import { normalizeMoney } from "../utils/money.js";
import { calculateCheckoutTotals } from "../services/checkoutTotals.js";

const normalizeApplicableProducts = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((productId) => String(productId || "").trim())
        .filter((productId) => mongoose.Types.ObjectId.isValid(productId)),
    ),
  );
};

const buildCouponPayload = (body) => {
  const applicabilityType =
    body.applicabilityType === "selected" ? "selected" : "all";
  const applicableProducts = normalizeApplicableProducts(
    body.applicableProducts,
  );

  if (applicabilityType === "selected" && applicableProducts.length === 0) {
    throw new ApiError(422, "Select at least one fragrance for this coupon.");
  }

  return {
    code: normalizeCouponCode(body.code),
    discountType: body.discountType,
    discountValue: Number(body.discountValue),
    minOrderAmount: Number(body.minOrderAmount || 0),
    maxDiscount:
      body.maxDiscount === undefined ||
      body.maxDiscount === null ||
      body.maxDiscount === ""
        ? null
        : Number(body.maxDiscount),
    expiryDate: body.expiryDate || null,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    applicabilityType,
    applicableProducts:
      applicabilityType === "selected" ? applicableProducts : [],
  };
};

const getCouponInputFromRequest = async (body) => {
  const items = normalizeOrderItems(body);

  if (items.length > 0) {
    const { preparedItems, subtotalAmount } =
      await buildPreparedOrderItems(items);
    return { preparedItems, subtotalAmount };
  }

  const cartTotal = Number(body.cartTotal);

  if (!Number.isFinite(cartTotal) || cartTotal < 0) {
    throw new ApiError(400, "A valid cart total or order items are required");
  }

  return { preparedItems: null, subtotalAmount: cartTotal };
};

const buildCouponResponse = (coupon) => serializeCoupon(coupon);

const sendCouponApplyFailure = ({ res, error, code, subtotalAmount }) => {
  const subtotal = normalizeMoney(subtotalAmount);
  const totals = calculateCheckoutTotals({ subtotalAmount: subtotal });
  const message = error.message || "Invalid coupon code";

  return res.status(error.statusCode || 400).json({
    success: false,
    message,
    data: {
      success: false,
      code: normalizeCouponCode(code),
      discount: 0,
      finalTotal: totals.totalAmount,
      subtotal,
      shippingCharge: totals.shippingCharge,
      totalBeforeDiscount: totals.totalBeforeDiscount,
      eligibleSubtotal: 0,
      ineligibleSubtotal: subtotal,
      partialApplication: false,
      message,
      coupon: null,
    },
  });
};

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find()
    .sort({ createdAt: -1 })
    .populate("applicableProducts", "name brand image images price sizes");

  res.json({
    success: true,
    data: coupons.map(buildCouponResponse),
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(buildCouponPayload(req.body));
  await coupon.populate(
    "applicableProducts",
    "name brand image images price sizes",
  );

  res.status(201).json({
    success: true,
    data: buildCouponResponse(coupon),
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid coupon id");
  }

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    buildCouponPayload(req.body),
    {
      new: true,
      runValidators: true,
    },
  ).populate("applicableProducts", "name brand image images price sizes");

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.json({
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
  await coupon.populate(
    "applicableProducts",
    "name brand image images price sizes",
  );

  res.json({
    success: true,
    data: buildCouponResponse(coupon),
  });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  let subtotalAmount = Number(req.body.cartTotal || 0);

  try {
    const couponInput = await getCouponInputFromRequest(req.body);
    const { preparedItems } = couponInput;
    subtotalAmount = couponInput.subtotalAmount;

    const result = preparedItems
      ? await applyCouponToPreparedItems({
          code: req.body.code,
          preparedItems,
        })
      : await applyCouponToSubtotal({
          code: req.body.code,
          subtotalAmount,
        });

    const message = result.message || "Coupon applied successfully";

    res.json({
      success: true,
      message,
      data: {
        success: true,
        code: result.code,
        discount: result.discount,
        finalTotal: result.finalTotal,
        subtotal: result.subtotal,
        shippingCharge: result.shippingCharge,
        totalBeforeDiscount: result.totalBeforeDiscount,
        eligibleSubtotal: result.eligibleSubtotal,
        ineligibleSubtotal: result.ineligibleSubtotal,
        partialApplication: result.partialApplication,
        message,
        coupon: buildCouponResponse(result.coupon),
      },
    });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    sendCouponApplyFailure({
      res,
      error,
      code: req.body.code,
      subtotalAmount,
    });
  }
});
