import Coupon from "../models/Coupon.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import {
  addMoney,
  multiplyMoney,
  normalizeMoney,
  subtractMoney,
} from "../utils/money.js";
import { calculateCheckoutTotals } from "./checkoutTotals.js";

export const normalizeCouponCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const RESTRICTED_COUPON_MESSAGE =
  "Coupon not applicable for this product";

const APPLICABLE_PRODUCT_FIELDS = "name brand image images price sizes";

const normalizeProductId = (value) =>
  String(value?._id || value?.id || value || "")
    .trim()
    .toString();

const normalizeProductName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getCouponApplicabilityType = (coupon) =>
  coupon?.applicabilityType === "selected" ? "selected" : "all";

const getApplicableProductIds = (coupon) =>
  Array.from(
    new Set(
      (coupon?.applicableProducts || [])
        .map((product) => normalizeProductId(product))
        .filter(Boolean),
    ),
  );

const getApplicableProductNames = (coupon) =>
  Array.from(
    new Set(
      (coupon?.applicableProducts || [])
        .map((product) =>
          product && typeof product === "object"
            ? normalizeProductName(product.name)
            : "",
        )
        .filter(Boolean),
    ),
  );

const findCouponByCode = (code) =>
  Coupon.findOne({ code }).populate(
    "applicableProducts",
    APPLICABLE_PRODUCT_FIELDS,
  );

const serializeApplicableProduct = (product) => {
  if (!product || typeof product !== "object") return null;

  const id = normalizeProductId(product);
  if (!id) return null;

  return {
    _id: id,
    id,
    name: product.name || "",
    brand: product.brand || "",
    image: product.image || product.images?.[0] || "",
    images: Array.isArray(product.images) ? product.images : [],
    price: normalizeMoney(product.price || product.sizes?.[0]?.price || 0),
  };
};

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
    applicabilityType: getCouponApplicabilityType(raw),
    applicableProductIds: getApplicableProductIds(raw),
    applicableProducts: getApplicableProductIds(raw).map((id) => {
      const product = (raw.applicableProducts || []).find(
        (item) => normalizeProductId(item) === id,
      );

      return (
        serializeApplicableProduct(product) || {
          _id: id,
          id,
          name: "",
          brand: "",
        }
      );
    }),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : "",
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : "",
  };
};

export const calculateCouponDiscount = (coupon, subtotalAmount) => {
  const subtotal = normalizeMoney(subtotalAmount);
  let discount =
    coupon.discountType === "percentage"
      ? multiplyMoney(subtotal, Number(coupon.discountValue || 0) / 100)
      : Number(coupon.discountValue || 0);

  if (
    coupon.discountType === "percentage" &&
    coupon.maxDiscount !== null &&
    coupon.maxDiscount !== undefined
  ) {
    discount = Math.min(discount, Number(coupon.maxDiscount || 0));
  }

  discount = normalizeMoney(Math.min(discount, subtotal));

  return {
    subtotal,
    discount,
    finalTotal: subtotal > 0 ? normalizeMoney(subtractMoney(subtotal, discount)) : 0,
  };
};

const getLineTotal = (item) =>
  normalizeMoney(
    multiplyMoney(
      Number(item.price ?? item.priceAtPurchase ?? 0),
      Number(item.quantity || 1),
    ),
  );

const getPreparedItemsSubtotal = (items = []) =>
  normalizeMoney(addMoney(...items.map((item) => getLineTotal(item))));

const getEligibleItems = (coupon, preparedItems = []) => {
  if (getCouponApplicabilityType(coupon) !== "selected") {
    return preparedItems;
  }

  const applicableProductIds = new Set(getApplicableProductIds(coupon));
  const applicableProductNames = new Set(getApplicableProductNames(coupon));

  return preparedItems.filter((item) => {
    const itemProductIds = [
      item.productId,
      item.product?._id,
      item.product?.id,
      item._id,
      item.id,
    ]
      .map((productId) => normalizeProductId(productId))
      .filter(Boolean);

    const itemProductNames = [
      item.productName,
      item.name,
      item.product?.name,
    ]
      .map((productName) => normalizeProductName(productName))
      .filter(Boolean);

    return (
      itemProductIds.some((productId) => applicableProductIds.has(productId)) ||
      itemProductNames.some((productName) =>
        applicableProductNames.has(productName),
      )
    );
  });
};

export const validateCouponState = (coupon) => {
  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new ApiError(400, "This coupon is currently inactive");
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
    throw new ApiError(400, "This coupon has expired");
  }
};

export const validateCouponForSubtotal = (coupon, subtotalAmount) => {
  const subtotal = normalizeMoney(subtotalAmount);

  validateCouponState(coupon);

  if (subtotal < Number(coupon.minOrderAmount || 0)) {
    throw new ApiError(400, "Minimum order value not reached");
  }

  return subtotal;
};

export const applyCouponToPreparedItems = async ({
  code,
  preparedItems = [],
}) => {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    throw new ApiError(400, "Coupon code is required");
  }

  const coupon = await findCouponByCode(normalizedCode);
  validateCouponState(coupon);

  const subtotal = getPreparedItemsSubtotal(preparedItems);
  const eligibleItems = getEligibleItems(coupon, preparedItems);
  const eligibleSubtotal = getPreparedItemsSubtotal(eligibleItems);

  if (
    getCouponApplicabilityType(coupon) === "selected" &&
    eligibleSubtotal <= 0
  ) {
    throw new ApiError(400, RESTRICTED_COUPON_MESSAGE);
  }

  validateCouponForSubtotal(coupon, eligibleSubtotal);
  const eligibleTotals = calculateCouponDiscount(coupon, eligibleSubtotal);
  const discount = eligibleTotals.discount;
  const payableTotals = calculateCheckoutTotals({
    subtotalAmount: subtotal,
    discountAmount: discount,
  });
  const partialApplication =
    getCouponApplicabilityType(coupon) === "selected" &&
    eligibleItems.length < preparedItems.length;

  return {
    coupon,
    code: normalizedCode,
    subtotal,
    eligibleSubtotal,
    ineligibleSubtotal: normalizeMoney(
      subtractMoney(subtotal, eligibleSubtotal),
    ),
    discount,
    finalTotal: payableTotals.totalAmount,
    shippingCharge: payableTotals.shippingCharge,
    totalBeforeDiscount: payableTotals.totalBeforeDiscount,
    partialApplication,
    message: partialApplication
      ? "Discount applied only to eligible fragrances."
      : "Coupon applied successfully",
  };
};

export const applyCouponToSubtotal = async ({ code, subtotalAmount }) => {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    throw new ApiError(400, "Coupon code is required");
  }

  const coupon = await findCouponByCode(normalizedCode);

  if (getCouponApplicabilityType(coupon) === "selected") {
    throw new ApiError(400, RESTRICTED_COUPON_MESSAGE);
  }

  const subtotal = normalizeMoney(subtotalAmount);
  validateCouponForSubtotal(coupon, subtotal);
  const totals = calculateCouponDiscount(coupon, subtotal);
  const payableTotals = calculateCheckoutTotals({
    subtotalAmount: subtotal,
    discountAmount: totals.discount,
  });

  return {
    coupon,
    code: normalizedCode,
    subtotal,
    discount: totals.discount,
    finalTotal: payableTotals.totalAmount,
    eligibleSubtotal: totals.subtotal,
    ineligibleSubtotal: 0,
    shippingCharge: payableTotals.shippingCharge,
    totalBeforeDiscount: payableTotals.totalBeforeDiscount,
    partialApplication: false,
    message: "Coupon applied successfully",
  };
};
