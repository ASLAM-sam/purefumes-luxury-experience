import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { clearProductCache } from "./productController.js";
import {
  createPaginationMeta,
  escapeRegex,
  getPagination,
} from "../utils/apiFeatures.js";
import { getCreatedAtRangeFilter } from "../utils/dateRange.js";
import {
  cancelOwnedOrder,
  createAuthenticatedOrder,
  getOwnedOrder,
  getUserOrders,
  serializeOrder,
  updateOrderStatusAndNotify,
} from "../services/orders/orderService.js";
import { ensureOrdersPublicIds } from "../services/orders/publicOrderIdService.js";
import { mergeGuestCart } from "../services/cart/cartService.js";
import {
  buildOrderStatusFilter,
  buildSuccessfulOrderFilter,
} from "../utils/orderStatusFilter.js";

const buildOrderSearchFilter = (search = "") => {
  const normalized = String(search || "").trim();
  if (!normalized) return {};

  const withoutHash = normalized.replace(/^#/, "");
  const safeSearch = escapeRegex(normalized);
  const safePublicOrderId = escapeRegex(withoutHash);

  return {
    $or: [
      { publicOrderId: { $regex: safePublicOrderId, $options: "i" } },
      { customerName: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { mobileNumber: { $regex: safeSearch, $options: "i" } },
      { phone: { $regex: safeSearch, $options: "i" } },
      { mobile: { $regex: safeSearch, $options: "i" } },
      { "shippingAddress.mobile": { $regex: safeSearch, $options: "i" } },
    ],
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
  const { orders, total } = await getUserOrders({
    user: req.user,
    page,
    limit,
  });

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

  const order = await cancelOwnedOrder({
    orderId: req.params.id,
    user: req.user,
  });
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
  const filterParts = [];

  if (req.query.status) {
    filterParts.push(buildOrderStatusFilter(req.query.status));
  }

  const createdAt = getCreatedAtRangeFilter(req.query);
  if (createdAt) {
    filterParts.push({ createdAt });
  }

  const searchFilter = buildOrderSearchFilter(req.query.search);
  if (Object.keys(searchFilter).length) {
    filterParts.push(searchFilter);
  }

  const filter = buildSuccessfulOrderFilter(...filterParts);

  const shouldPaginate =
    req.query.page !== undefined || req.query.limit !== undefined;

  if (!shouldPaginate) {
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("product", "name brand category image images stock")
      .populate("items.productId", "name brand category image images stock")
      .lean({ virtuals: true });

    const ordersWithPublicIds = await ensureOrdersPublicIds(orders);

    return res.json({
      success: true,
      data: ordersWithPublicIds.map(serializeOrder),
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

  const ordersWithPublicIds = await ensureOrdersPublicIds(orders);

  res.json({
    success: true,
    data: {
      orders: ordersWithPublicIds.map(serializeOrder),
      pagination: createPaginationMeta({ page, limit, total }),
    },
  });
});

export const getUnseenOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find(
    buildSuccessfulOrderFilter({ isSeen: false }),
  )
    .sort({ createdAt: -1 })
    .populate("product", "name brand category image images stock")
    .populate("items.productId", "name brand category image images stock")
    .lean({ virtuals: true });

  const ordersWithPublicIds = await ensureOrdersPublicIds(orders);

  res.json({
    success: true,
    data: ordersWithPublicIds.map(serializeOrder),
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

  const [orderWithPublicId] = await ensureOrdersPublicIds([order]);

  res.json({ success: true, data: serializeOrder(orderWithPublicId) });
});
