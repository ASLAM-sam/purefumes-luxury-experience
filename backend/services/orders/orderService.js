import crypto from "crypto";
import mongoose from "mongoose";
import logger from "../../config/logger.js";
import Order, { ORDER_STATUSES } from "../../models/Order.js";
import User from "../../models/User.js";
import AnalyticsEvent from "../../models/AnalyticsEvent.js";
import { ApiError } from "../../middlewares/errorMiddleware.js";
import env from "../../config/env.js";
import { addEmailJob } from "../../queues/emailQueue.js";
import { applyCouponToSubtotal } from "../couponService.js";
import { buildPreparedOrderItems, normalizeOrderItems } from "../pricingService.js";
import { clearCart } from "../cart/cartService.js";
import {
  countOrdersByUserId,
  countOrdersByUserIdentity,
  findOrderById,
  findOrdersByUserId,
  findOrdersByUserIdentity,
} from "../../repositories/orderRepository.js";

const shippingToString = (shippingAddress = {}) =>
  [
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.postalCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

const isDevelopmentPaymentBypass = () => Boolean(env.PAYMENT_BYPASS_ENABLED);

const applyDevelopmentPaymentBypass = (body = {}) => {
  if (!isDevelopmentPaymentBypass()) {
    return body;
  }

  logger.warn("PAYMENT BYPASS MODE ENABLED", {
    environment: env.NODE_ENV,
    paymentGateway: body.paymentGateway || "test-bypass",
  });

  return {
    ...body,
    paymentStatus: "paid",
    paymentMethod: "test-bypass",
    paymentId: String(body.paymentId || "TEST_PAYMENT_ID"),
    paymentOrderId: String(body.paymentOrderId || `TEST_ORDER_${Date.now()}`),
    paymentSignature: String(body.paymentSignature || "TEST_SIGNATURE"),
    paymentGateway: String(body.paymentGateway || "test-bypass"),
  };
};

const normalizeShippingAddress = ({ body, user }) => {
  const source = body.shippingAddress || {};
  const fullName = String(source.fullName || body.customerName || user.name || "").trim();
  const mobile = String(source.mobile || body.phone || user.mobile || "").trim();
  const line1 = String(source.line1 || body.address || "").trim();
  const line2 = String(source.line2 || "").trim();
  const city = String(source.city || "Hyderabad").trim();
  const state = String(source.state || "Telangana").trim();
  const postalCode = String(source.postalCode || "").trim();
  const country = String(source.country || "India").trim();

  if (!fullName || !mobile || !line1) {
    throw new ApiError(422, "Shipping full name, mobile, and address are required");
  }

  return { fullName, mobile, line1, line2, city, state, postalCode, country };
};

const verifyRazorpayPayment = ({ paymentOrderId, paymentId, paymentSignature }) => {
  if (isDevelopmentPaymentBypass()) return true;
  if (!env.RAZORPAY_KEY_SECRET || !paymentSignature) return true;

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${paymentOrderId}|${paymentId}`)
    .digest("hex");
  const receivedSignature = String(paymentSignature);

  if (expectedSignature.length !== receivedSignature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature),
  );
};

const resolvePaymentStatus = (body) => {
  if (isDevelopmentPaymentBypass()) return "paid";
  if (body.paymentStatus) return body.paymentStatus;
  if (body.paymentId && body.paymentGateway === "Razorpay") return "paid";
  if (body.paymentMethod) return "pending";
  return "pending";
};

export const serializeOrder = (order) => {
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
    userId: raw.userId?._id?.toString?.() || raw.userId?.toString?.() || raw.userId || "",
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
    paymentStatus: raw.paymentStatus || "pending",
    status: raw.status || raw.orderStatus || "Pending",
    orderStatus: raw.orderStatus || raw.status || "Pending",
    items: Array.isArray(raw.items)
      ? raw.items.map((item) => ({
          ...item,
          priceAtPurchase: item.priceAtPurchase ?? item.price,
          productImage: item.productImage || item.productId?.image || item.productId?.images?.[0] || "",
        }))
      : [],
  };
};

export const createAuthenticatedOrder = async ({ user, body }) => {
  const orderInput = applyDevelopmentPaymentBypass(body);
  const rawItems = normalizeOrderItems(orderInput);

  if (!rawItems.length) {
    throw new ApiError(400, "Order items are required");
  }

  if (
    orderInput.paymentGateway === "Razorpay" &&
    orderInput.paymentSignature &&
    !verifyRazorpayPayment({
      paymentOrderId: orderInput.paymentOrderId,
      paymentId: orderInput.paymentId,
      paymentSignature: orderInput.paymentSignature,
    })
  ) {
    throw new ApiError(400, "Payment verification failed");
  }

  const shippingAddress = normalizeShippingAddress({ body: orderInput, user });
  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const { preparedItems, subtotalAmount } = await buildPreparedOrderItems(rawItems, {
        reserveStock: true,
        session,
      });
      let discountAmount = 0;
      let totalAmount = subtotalAmount;
      let couponCode = "";

      if (String(orderInput.couponCode || "").trim()) {
        const couponResult = await applyCouponToSubtotal({
          code: orderInput.couponCode,
          subtotalAmount,
        });

        couponCode = couponResult.code;
        discountAmount = couponResult.discount;
        totalAmount = couponResult.finalTotal;
      }

      const [order] = await Order.create(
        [
          {
            userId: user._id,
            email: user.email,
            mobile: user.mobile || shippingAddress.mobile,
            customerName: shippingAddress.fullName,
            phone: shippingAddress.mobile,
            address: shippingToString(shippingAddress),
            shippingAddress,
            product: preparedItems[0]?.productId,
            productName: preparedItems[0]?.productName || "",
            brand: preparedItems[0]?.brand || "",
            size: preparedItems[0]?.size || "",
            price: preparedItems[0]?.price || totalAmount,
            items: preparedItems,
            totalAmount,
            subtotalAmount,
            discountAmount,
            couponCode,
            paymentId: String(orderInput.paymentId || "").trim(),
            paymentMethod: String(orderInput.paymentMethod || "").trim(),
            paymentGateway: String(orderInput.paymentGateway || "").trim(),
            paymentOrderId: String(orderInput.paymentOrderId || "").trim(),
            paymentSignature: String(orderInput.paymentSignature || "").trim(),
            paymentStatus: resolvePaymentStatus(orderInput),
            status: "Pending",
            orderStatus: "Pending",
          },
        ],
        { session },
      );

      createdOrder = order;

      await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { totalOrders: 1, totalSpent: totalAmount },
          $push: { orderHistory: order._id },
        },
        { session },
      );

      await AnalyticsEvent.create(
        [
          {
            type: "purchase",
            userId: user._id,
            orderId: order._id,
            revenue: totalAmount,
            metadata: {
              itemCount: preparedItems.reduce((sum, item) => sum + item.quantity, 0),
              couponCode,
            },
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  if (orderInput.clearCart !== false) {
    await clearCart(user._id);
  }

  await addEmailJob({
    to: user.email,
    template: "orderConfirmation",
    data: { name: user.name, order: serializeOrder(createdOrder) },
  });
  logger.info("Order created", {
    orderId: createdOrder.id || createdOrder._id?.toString?.(),
    userId: user.id,
    totalAmount: createdOrder.totalAmount,
  });

  return serializeOrder(createdOrder);
};

export const getUserOrders = async ({ userId, user = null, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [orders, total] = user
    ? await Promise.all([
        findOrdersByUserIdentity({ user, skip, limit }),
        countOrdersByUserIdentity(user),
      ])
    : await Promise.all([
        findOrdersByUserId({ userId, skip, limit }),
        countOrdersByUserId(userId),
      ]);

  return { orders: orders.map(serializeOrder), total };
};

export const getOwnedOrder = async ({ orderId, user }) => {
  const order = await findOrderById(orderId);

  if (!order) throw new ApiError(404, "Order not found");

  const orderUserId = String(order.userId?._id || order.userId || "");
  const orderEmail = String(order.email || "").trim().toLowerCase();
  const orderMobile = String(order.mobile || order.phone || "").trim();
  const ownsOrder = orderUserId
    ? orderUserId === String(user._id)
    : (orderEmail && orderEmail === String(user.email || "").trim().toLowerCase()) ||
      (orderMobile && orderMobile === String(user.mobile || "").trim());

  if (!ownsOrder && user.role !== "admin") {
    throw new ApiError(403, "You can only access your own orders");
  }

  return serializeOrder(order);
};

export const cancelOwnedOrder = async ({ orderId, user }) => {
  const order = await Order.findById(orderId);

  if (!order) throw new ApiError(404, "Order not found");
  if (String(order.userId) !== String(user._id)) throw new ApiError(403, "Order access denied");
  if (order.status !== "Pending") throw new ApiError(400, "Only pending orders can be cancelled");

  order.status = "Cancelled";
  order.orderStatus = "Cancelled";
  await order.save();
  logger.info("Order cancelled", { orderId: order.id || order._id?.toString?.(), userId: user.id });

  return serializeOrder(order);
};

export const updateOrderStatusAndNotify = async ({ orderId, status, trackingId, deliveryDate }) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${ORDER_STATUSES.join(", ")}`);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status,
      orderStatus: status,
      ...(trackingId !== undefined ? { trackingId } : {}),
      ...(deliveryDate ? { deliveryDate } : {}),
    },
    { new: true, runValidators: true },
  ).populate("userId", "name email");

  if (!order) throw new ApiError(404, "Order not found");

  if (order.userId?.email) {
    await addEmailJob({
      to: order.userId.email,
      template: "orderStatus",
      data: { name: order.userId.name, order: serializeOrder(order) },
    });
  }
  logger.info("Order status updated", {
    orderId: order.id || order._id?.toString?.(),
    status,
    trackingId: trackingId || "",
  });

  return serializeOrder(order);
};
