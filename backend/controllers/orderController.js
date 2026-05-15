import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { clearProductCache } from "./productController.js";
import { createPaginationMeta, getPagination } from "../utils/apiFeatures.js";
import { getCreatedAtRangeFilter } from "../utils/dateRange.js";
import { applyCouponToSubtotal } from "../services/couponService.js";
import {
  buildPreparedOrderItems,
  normalizeOrderItems,
} from "../services/pricingService.js";
import {
  cancelOwnedOrder,
  createAuthenticatedOrder,
  getOwnedOrder,
  getUserOrders,
  serializeOrder,
  updateOrderStatusAndNotify,
} from "../services/orders/orderService.js";
import { mergeGuestCart } from "../services/cart/cartService.js";

const normalizeOrderResponse = (order) => {
  const raw =
    typeof order?.toObject === "function"
      ? order.toObject({ virtuals: true })
      : order;
  if (!raw) return raw;

  const firstItem = raw.items?.[0] || {};
  const productId =
    raw.productId ||
    raw.product?.toString?.() ||
    raw.product ||
    firstItem.productId?._id?.toString?.() ||
    firstItem.productId?.toString?.() ||
    firstItem.productId ||
    "";
  const { __v, ...cleanOrder } = raw;

  return {
    ...cleanOrder,
    id: raw.id || raw._id?.toString?.() || raw._id,
    product: raw.product || productId,
    productId,
    productName:
      raw.productName ||
      firstItem.productName ||
      firstItem.productId?.name ||
      "",
    brand: raw.brand || firstItem.brand || firstItem.productId?.brand || "",
    size: raw.size || firstItem.size || "",
    price: Number(raw.price || firstItem.price || raw.totalAmount || 0),
    totalAmount: Number(raw.totalAmount || raw.price || firstItem.price || 0),
    subtotalAmount: Number(
      raw.subtotalAmount || raw.totalAmount || raw.price || firstItem.price || 0,
    ),
    discountAmount: Number(raw.discountAmount || 0),
    couponCode: raw.couponCode || "",
    paymentId: raw.paymentId || "",
    paymentMethod: raw.paymentMethod || "",
    paymentGateway: raw.paymentGateway || "",
    paymentOrderId: raw.paymentOrderId || "",
    paymentSignature: raw.paymentSignature || "",
    items: Array.isArray(raw.items) ? raw.items : [],
  };
};

export const placeOrder = asyncHandler(async (req, res) => {
  const createdOrder = await createAuthenticatedOrder({
    user: req.user,
    body: req.body,
  });
  clearProductCache();
  res.status(201).json({ success: true, data: createdOrder });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { orders, total } = await getUserOrders({ user: req.user, page, limit });

  res.json({
    success: true,
    data: {
      orders,
      pagination: createPaginationMeta({ page, limit, total }),
    },
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await getOwnedOrder({ orderId: req.params.id, user: req.user });
  res.json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await cancelOwnedOrder({ orderId: req.params.id, user: req.user });
  res.json({ success: true, data: order });
});

export const reorder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await getOwnedOrder({ orderId: req.params.id, user: req.user });
  const cart = await mergeGuestCart({
    userId: req.user._id,
    guestItems: order.items.map((item) => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      size: item.size,
    })),
  });

  res.json({ success: true, data: cart });
});

export const getOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const createdAt = getCreatedAtRangeFilter(req.query);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  const shouldPaginate =
    req.query.page !== undefined || req.query.limit !== undefined;

  if (!shouldPaginate) {
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("product", "name brand category image images stock")
      .populate("items.productId", "name brand category image images stock")
      .lean({ virtuals: true });

    return res.json({
      success: true,
      data: orders.map(normalizeOrderResponse),
    });
  }

  const { page, limit, skip } = getPagination(req.query);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("product", "name brand category image images stock")
      .populate("items.productId", "name brand category image images stock")
      .lean({ virtuals: true }),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      orders: orders.map(normalizeOrderResponse),
      pagination: createPaginationMeta({ page, limit, total }),
    },
  });
});

export const getUnseenOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find({ isSeen: false })
    .sort({ createdAt: -1 })
    .populate("product", "name brand category image images stock")
    .populate("items.productId", "name brand category image images stock")
    .lean({ virtuals: true });

  res.json({
    success: true,
    data: orders.map(normalizeOrderResponse),
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }

  if (!ORDER_STATUSES.includes(req.body.status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
    );
  }

  const order = await updateOrderStatusAndNotify({
    orderId: req.params.id,
    status: req.body.status,
    trackingId: req.body.trackingId,
    deliveryDate: req.body.deliveryDate,
  });

  res.json({ success: true, data: order });
});

export const markOrderSeen = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { isSeen: true },
    { new: true, runValidators: true },
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.json({ success: true, data: normalizeOrderResponse(order) });
});
