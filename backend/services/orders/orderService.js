import mongoose from "mongoose";
import logger from "../../config/logger.js";
import Order, { ORDER_STATUSES, PAYMENT_STATUSES } from "../../models/Order.js";
import User from "../../models/User.js";
import AnalyticsEvent from "../../models/AnalyticsEvent.js";
import { ApiError } from "../../middlewares/errorMiddleware.js";
import env from "../../config/env.js";
import { addEmailJob } from "../../queues/emailQueue.js";
import { applyCouponToPreparedItems } from "../couponService.js";
import {
  buildPreparedOrderItems,
  normalizeOrderItems,
} from "../pricingService.js";
import { clearCart } from "../cart/cartService.js";
import { getEffectivePaymentMode } from "../paymentModeService.js";
import {
  verifyRazorpayOrderAmount,
  verifyRazorpaySignature,
} from "../razorpayService.js";
import {
  ensureOrderPublicId,
  ensureOrdersPublicIds,
} from "./publicOrderIdService.js";
import {
  countOrdersByUserId,
  countOrdersByUserIdentity,
  findOrderById,
  findOrdersByUserId,
  findOrdersByUserIdentity,
} from "../../repositories/orderRepository.js";
import { normalizeMoney } from "../../utils/money.js";
import { upsertGuestCustomer } from "../user/customerUpsertService.js";
import { calculateCheckoutTotals } from "../checkoutTotals.js";

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

const normalizeEmail = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizePhone = (value = "") => String(value || "").trim();

const isTestPaymentMode = (paymentMode = "live") => paymentMode === "test";
const PAID_CONFIRMED_STATUS = "Confirmed";

const buildOrderAddressEntry = (shippingAddress = {}) => {
  const line1 = String(shippingAddress.line1 || "").trim();

  if (!line1) {
    return null;
  }

  return {
    label: "Latest Order",
    fullName: String(shippingAddress.fullName || "").trim(),
    mobile: String(shippingAddress.mobile || "").trim(),
    line1,
    line2: String(shippingAddress.line2 || "").trim(),
    city: String(shippingAddress.city || "Hyderabad").trim(),
    state: String(shippingAddress.state || "Telangana").trim(),
    postalCode: String(shippingAddress.postalCode || "").trim(),
    country: String(shippingAddress.country || "India").trim(),
    isDefault: true,
  };
};

const normalizePaymentGateway = (gateway = "") => {
  const normalized = String(gateway || "").trim();
  return normalized.toLowerCase() === "razorpay" ? "Razorpay" : normalized;
};

const isRazorpayOrderInput = (orderInput = {}) =>
  normalizePaymentGateway(orderInput.paymentGateway) === "Razorpay";

const isTestOrderInput = (orderInput = {}, { paymentMode = "live" } = {}) => {
  const paymentGateway = String(orderInput.paymentGateway || "").trim().toLowerCase();
  const paymentId = String(orderInput.paymentId || "").trim();
  const paymentOrderId = String(orderInput.paymentOrderId || "").trim();
  const paymentMethod = String(orderInput.paymentMethod || "").trim().toLowerCase();

  return (
    isTestPaymentMode(paymentMode) ||
    paymentGateway === "test-mode" ||
    paymentMethod === "test-bypass" ||
    paymentId.toUpperCase().startsWith("TEST_") ||
    paymentOrderId.toUpperCase().startsWith("TEST_")
  );
};

const normalizePaymentStatus = (status = "") => {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();
  if (normalized === "success" || normalized === "completed") {
    return "paid";
  }
  return PAYMENT_STATUSES.includes(normalized) ? normalized : "";
};

const applyDevelopmentPaymentBypass = (
  body = {},
  { paymentMode = "live" } = {},
) => {
  if (!isTestPaymentMode(paymentMode)) {
    return body;
  }

  logger.warn("TEST PAYMENT MODE ENABLED", {
    environment: env.NODE_ENV,
    paymentGateway: body.paymentGateway || "test-mode",
  });

  const requestedPaymentStatus = String(body.paymentStatus || "")
    .trim()
    .toLowerCase();
  const normalizedPaymentStatus =
    requestedPaymentStatus === "failed" || requestedPaymentStatus === "pending"
      ? requestedPaymentStatus
      : requestedPaymentStatus === "cod"
        ? "pending"
        : "paid";
  const normalizedPaymentMethod =
    requestedPaymentStatus === "cod"
      ? "cod"
      : String(body.paymentMethod || "test-bypass").trim() || "test-bypass";

  return {
    ...body,
    paymentStatus: normalizedPaymentStatus,
    paymentMethod: normalizedPaymentMethod,
    paymentId: String(body.paymentId || `TEST_PAYMENT_${Date.now()}`),
    paymentOrderId: String(body.paymentOrderId || `TEST_ORDER_${Date.now()}`),
    paymentSignature: String(body.paymentSignature || "TEST_SIGNATURE"),
    paymentGateway: String(body.paymentGateway || "test-mode"),
  };
};

const normalizeShippingAddress = ({ body, user = null }) => {
  const source = body.shippingAddress || {};
  const fullName = String(
    source.fullName || body.customerName || user?.name || "",
  ).trim();
  const mobile = String(
    source.mobile ||
      body.mobileNumber ||
      body.mobile ||
      body.phone ||
      user?.mobile ||
      "",
  ).trim();
  const line1 = String(source.line1 || body.address || "").trim();
  const line2 = String(source.line2 || "").trim();
  const city = String(source.city || "Hyderabad").trim();
  const state = String(source.state || "Telangana").trim();
  const postalCode = String(source.postalCode || "").trim();
  const country = String(source.country || "India").trim();

  if (!fullName || !mobile || !line1) {
    throw new ApiError(
      422,
      "Shipping full name, mobile, and address are required",
    );
  }

  return { fullName, mobile, line1, line2, city, state, postalCode, country };
};

const verifyRazorpayPayment = async (
  { paymentOrderId, paymentId, paymentSignature, expectedAmount },
  { paymentMode = "live" } = {},
) => {
  if (isTestPaymentMode(paymentMode)) return true;

  try {
    const hasValidSignature = verifyRazorpaySignature({
      orderId: paymentOrderId,
      paymentId,
      signature: paymentSignature,
    });

    if (!hasValidSignature) return false;

    return await verifyRazorpayOrderAmount({
      orderId: paymentOrderId,
      expectedAmount,
    });
  } catch (error) {
    logger.warn("Razorpay payment verification failed before order save", {
      message: error.message,
    });
    return false;
  }
};

const resolvePaymentStatus = (body, { paymentMode = "live" } = {}) => {
  const requestedPaymentStatus = normalizePaymentStatus(body.paymentStatus);

  if (isTestPaymentMode(paymentMode)) {
    return requestedPaymentStatus || "paid";
  }

  if (isRazorpayOrderInput(body) && body.paymentId) return "paid";
  if (requestedPaymentStatus) return requestedPaymentStatus;
  if (body.paymentMethod) return "pending";
  return "pending";
};

const resolveOrderStatus = (paymentStatus) =>
  paymentStatus === "paid" ? PAID_CONFIRMED_STATUS : "Pending";

const resolveDisplayPaymentStatus = (raw = {}) => {
  const paymentStatus = normalizePaymentStatus(raw.paymentStatus);
  if (
    isRazorpayOrderInput(raw) &&
    raw.paymentId &&
    paymentStatus !== "failed" &&
    paymentStatus !== "refunded"
  ) {
    return "paid";
  }

  return paymentStatus || "pending";
};

const normalizeDisplayStatus = (raw = {}) => {
  const status = raw.status || raw.orderStatus || "Pending";
  return resolveDisplayPaymentStatus(raw) === "paid" && status === "Pending"
    ? PAID_CONFIRMED_STATUS
    : status;
};

const findExistingRazorpayOrder = async (orderInput) => {
  const paymentId = String(orderInput.paymentId || "").trim();
  const paymentOrderId = String(orderInput.paymentOrderId || "").trim();

  if (
    !isRazorpayOrderInput(orderInput) ||
    (!paymentId && !paymentOrderId)
  ) {
    return null;
  }

  return Order.findOne({
    paymentGateway: "Razorpay",
    $or: [
      ...(paymentId ? [{ paymentId }] : []),
      ...(paymentOrderId ? [{ paymentOrderId }] : []),
    ],
  });
};

const confirmExistingRazorpayOrder = async ({
  existingOrder,
  orderInput,
  paymentMode,
}) => {
  if (!existingOrder || !isRazorpayOrderInput(orderInput)) return existingOrder;

  const paymentOrderId = String(orderInput.paymentOrderId || "").trim();
  const paymentId = String(orderInput.paymentId || "").trim();
  const paymentSignature = String(orderInput.paymentSignature || "").trim();

  if (!paymentOrderId || !paymentId || !paymentSignature) {
    return existingOrder;
  }

  if (
    existingOrder.paymentStatus === "paid" &&
    existingOrder.status === PAID_CONFIRMED_STATUS &&
    existingOrder.orderStatus === PAID_CONFIRMED_STATUS
  ) {
    return existingOrder;
  }

  const verified = await verifyRazorpayPayment(
    {
      paymentOrderId,
      paymentId,
      paymentSignature,
      expectedAmount: existingOrder.totalAmount,
    },
    { paymentMode },
  );

  if (!verified) return existingOrder;

  return Order.findByIdAndUpdate(
    existingOrder._id,
    {
      $set: {
        paymentGateway: "Razorpay",
        paymentOrderId,
        paymentId,
        paymentSignature,
        paymentStatus: "paid",
        status: PAID_CONFIRMED_STATUS,
        orderStatus: PAID_CONFIRMED_STATUS,
      },
    },
    { new: true, runValidators: true },
  );
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
    publicOrderId: raw.publicOrderId || "",
    userId:
      raw.userId?._id?.toString?.() ||
      raw.userId?.toString?.() ||
      raw.userId ||
      "",
    customerName: raw.customerName || raw.shippingAddress?.fullName || "",
    email: normalizeEmail(raw.email),
    mobileNumber: normalizePhone(raw.mobileNumber || raw.mobile || raw.phone),
    mobile: normalizePhone(raw.mobile || raw.mobileNumber || raw.phone),
    phone: normalizePhone(raw.phone || raw.mobileNumber || raw.mobile),
    address: raw.address || shippingToString(raw.shippingAddress),
    product: raw.product || productId,
    productId,
    productName:
      raw.productName ||
      firstItem.productName ||
      firstItem.productId?.name ||
      "",
    brand: raw.brand || firstItem.brand || firstItem.productId?.brand || "",
    size: raw.size || firstItem.size || "",
    price: normalizeMoney(raw.price ?? firstItem.price ?? raw.totalAmount ?? 0),
    totalAmount: normalizeMoney(
      raw.totalAmount ?? raw.price ?? firstItem.price ?? 0,
    ),
    subtotalAmount: normalizeMoney(
      raw.subtotalAmount ??
        raw.totalAmount ??
        raw.price ??
        firstItem.price ??
        0,
    ),
    discountAmount: normalizeMoney(raw.discountAmount ?? 0),
    shippingCharge: normalizeMoney(raw.shippingCharge ?? 0),
    couponCode: raw.couponCode || "",
    paymentStatus: resolveDisplayPaymentStatus(raw),
    status: normalizeDisplayStatus(raw),
    orderStatus: normalizeDisplayStatus(raw),
    items: Array.isArray(raw.items)
      ? raw.items.map((item) => ({
          ...item,
          price: normalizeMoney(item.price ?? item.priceAtPurchase ?? 0),
          priceAtPurchase: normalizeMoney(
            item.priceAtPurchase ?? item.price ?? 0,
          ),
          productImage:
            item.productImage ||
            item.productId?.image ||
            item.productId?.images?.[0] ||
            "",
        }))
      : [],
  };
};

export const createAuthenticatedOrder = async ({ user, body }) => {
  const paymentMode = await getEffectivePaymentMode();
  const orderInput = applyDevelopmentPaymentBypass(body, { paymentMode });
  const rawItems = normalizeOrderItems(orderInput);

  if (!rawItems.length) {
    throw new ApiError(400, "Order items are required");
  }

  const existingRazorpayOrder = await findExistingRazorpayOrder(orderInput);

  if (existingRazorpayOrder) {
    const confirmedExistingOrder =
      (await confirmExistingRazorpayOrder({
        existingOrder: existingRazorpayOrder,
        orderInput,
        paymentMode,
      })) || existingRazorpayOrder;

    logger.info("Returning existing Razorpay order for idempotent checkout", {
      orderId:
        confirmedExistingOrder.id || confirmedExistingOrder._id?.toString?.(),
      paymentId: orderInput.paymentId,
      paymentOrderId: orderInput.paymentOrderId,
    });
    if (user?._id && orderInput.clearCart !== false) {
      await clearCart(user._id);
    }
    const orderWithPublicId = await ensureOrderPublicId(confirmedExistingOrder);
    return serializeOrder(orderWithPublicId);
  }

  const shippingAddress = normalizeShippingAddress({ body: orderInput, user });
  const customerEmail = normalizeEmail(orderInput.email || user?.email || "");
  const customerMobileNumber = normalizePhone(
    orderInput.mobileNumber ||
      orderInput.mobile ||
      shippingAddress.mobile ||
      user?.mobile ||
      "",
  );
  const customerPhone = normalizePhone(orderInput.phone || customerMobileNumber);
  const session = await mongoose.startSession();
  let createdOrder;
  let reusedExistingOrder = false;

  try {
    await session.withTransaction(async () => {
      const { preparedItems, subtotalAmount } = await buildPreparedOrderItems(
        rawItems,
        {
          reserveStock: true,
          session,
        },
      );
      let discountAmount = 0;
      let couponCode = "";

      if (String(orderInput.couponCode || "").trim()) {
        const couponResult = await applyCouponToPreparedItems({
          code: orderInput.couponCode,
          preparedItems,
        });

        couponCode = couponResult.code;
        discountAmount = couponResult.discount;
      }
      const payableTotals = calculateCheckoutTotals({
        subtotalAmount,
        discountAmount,
      });
      const shippingCharge = payableTotals.shippingCharge;
      const totalAmount = payableTotals.totalAmount;

      if (
        isRazorpayOrderInput(orderInput) &&
        !(await verifyRazorpayPayment(
          {
            paymentOrderId: orderInput.paymentOrderId,
            paymentId: orderInput.paymentId,
            paymentSignature: orderInput.paymentSignature,
            expectedAmount: totalAmount,
          },
          { paymentMode },
        ))
      ) {
        throw new ApiError(400, "Payment verification failed");
      }

      const paymentStatus = resolvePaymentStatus(orderInput, { paymentMode });
      const orderStatus = resolveOrderStatus(paymentStatus);
      const paymentGateway = normalizePaymentGateway(orderInput.paymentGateway);
      const isTestData = isTestOrderInput(orderInput, { paymentMode });
      const orderPlacedAt = new Date();
      const shippingAddressText = shippingToString(shippingAddress);
      const orderAddressEntry = buildOrderAddressEntry(shippingAddress);
      let ownerUserId = user?._id || null;
      let guestCustomer = null;

      if (!ownerUserId) {
        guestCustomer = await upsertGuestCustomer(
          {
            email: customerEmail,
            mobileNumber: customerMobileNumber,
            customerName: shippingAddress.fullName,
            address: shippingAddressText,
            shippingAddress,
            isTestData,
          },
          totalAmount,
          { session, orderDate: orderPlacedAt },
        );

        ownerUserId = guestCustomer?._id || null;
      }

      const [order] = await Order.create(
        [
          {
            userId: ownerUserId,
            email: customerEmail,
            mobileNumber: customerMobileNumber,
            mobile: customerMobileNumber,
            customerName: shippingAddress.fullName,
            phone: customerPhone || shippingAddress.mobile,
            address: shippingAddressText,
            shippingAddress,
            product: preparedItems[0]?.productId,
            productName: preparedItems[0]?.productName || "",
            brand: preparedItems[0]?.brand || "",
            size: preparedItems[0]?.size || "",
            price: preparedItems[0]?.price ?? totalAmount,
            items: preparedItems,
            totalAmount,
            subtotalAmount,
            discountAmount,
            shippingCharge,
            couponCode,
            paymentId: String(orderInput.paymentId || "").trim(),
            paymentMethod: String(orderInput.paymentMethod || "").trim(),
            paymentGateway,
            paymentOrderId: String(orderInput.paymentOrderId || "").trim(),
            paymentSignature: String(orderInput.paymentSignature || "").trim(),
            paymentStatus,
            status: orderStatus,
            orderStatus,
            isTestData,
          },
        ],
        { session },
      );

      createdOrder = order;

      if (user?._id) {
        const userUpdate = {
          $inc: { totalOrders: 1, totalSpent: totalAmount },
          $addToSet: { orderHistory: order._id },
          $set: {
            lastOrderDate: orderPlacedAt,
            customerName: shippingAddress.fullName,
            mobileNumber: customerMobileNumber,
            address: shippingAddressText,
          },
        };

        if (!user.mobile && customerMobileNumber) {
          userUpdate.$set.mobile = customerMobileNumber;
        }

        if (orderAddressEntry && (!Array.isArray(user.addresses) || user.addresses.length === 0)) {
          userUpdate.$set.addresses = [orderAddressEntry];
        }

        await User.findByIdAndUpdate(
          user._id,
          userUpdate,
          { session },
        );
      } else if (guestCustomer?._id) {
        await User.findByIdAndUpdate(
          guestCustomer._id,
          { $addToSet: { orderHistory: order._id } },
          { session },
        );
      }

      await AnalyticsEvent.create(
        [
          {
            type: "purchase",
            userId: ownerUserId,
            orderId: order._id,
            revenue: totalAmount,
            metadata: {
              itemCount: preparedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              ),
              couponCode,
              paymentGateway,
              customerEmail,
              customerMobileNumber,
              isTestData,
            },
            isTestData,
          },
        ],
        { session },
      );
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const existingOrder = await findExistingRazorpayOrder(orderInput);
    if (!existingOrder) {
      throw error;
    }

    reusedExistingOrder = true;
    createdOrder =
      (await confirmExistingRazorpayOrder({
        existingOrder,
        orderInput,
        paymentMode,
      })) || existingOrder;
  } finally {
    await session.endSession();
  }

  if (user?._id && orderInput.clearCart !== false) {
    await clearCart(user._id);
  }

  createdOrder = await ensureOrderPublicId(createdOrder);

  if (!reusedExistingOrder && customerEmail) {
    await addEmailJob({
      to: customerEmail,
      template: "orderConfirmation",
      data: {
        name: createdOrder.customerName || user?.name || "Customer",
        order: serializeOrder(createdOrder),
      },
    });
  }
  logger.info("Order created", {
    orderId: createdOrder.id || createdOrder._id?.toString?.(),
    userId:
      createdOrder.userId?._id?.toString?.() ||
      createdOrder.userId?.toString?.() ||
      user?.id ||
      "",
    customerEmail,
    totalAmount: createdOrder.totalAmount,
  });

  return serializeOrder(createdOrder);
};

export const getUserOrders = async ({
  userId,
  user = null,
  page = 1,
  limit = 20,
}) => {
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

  const ordersWithPublicIds = await ensureOrdersPublicIds(orders);

  return { orders: ordersWithPublicIds.map(serializeOrder), total };
};

export const getOwnedOrder = async ({ orderId, user }) => {
  const order = await findOrderById(orderId);

  if (!order) throw new ApiError(404, "Order not found");

  const orderUserId = String(order.userId?._id || order.userId || "");
  const orderEmail = String(order.email || "")
    .trim()
    .toLowerCase();
  const orderMobile = String(order.mobile || order.phone || "").trim();
  const ownsOrder = orderUserId
    ? orderUserId === String(user._id)
    : (orderEmail &&
        orderEmail ===
          String(user.email || "")
            .trim()
            .toLowerCase()) ||
      (orderMobile && orderMobile === String(user.mobile || "").trim());

  if (!ownsOrder && user.role !== "admin") {
    throw new ApiError(403, "You can only access your own orders");
  }

  const orderWithPublicId = await ensureOrderPublicId(order);

  return serializeOrder(orderWithPublicId);
};

export const cancelOwnedOrder = async ({ orderId, user }) => {
  const order = await Order.findById(orderId);

  if (!order) throw new ApiError(404, "Order not found");
  if (String(order.userId) !== String(user._id))
    throw new ApiError(403, "Order access denied");
  if (order.status !== "Pending")
    throw new ApiError(400, "Only pending orders can be cancelled");

  order.status = "Cancelled";
  order.orderStatus = "Cancelled";
  await order.save();
  logger.info("Order cancelled", {
    orderId: order.id || order._id?.toString?.(),
    userId: user.id,
  });

  const orderWithPublicId = await ensureOrderPublicId(order);

  return serializeOrder(orderWithPublicId);
};

export const updateOrderStatusAndNotify = async ({
  orderId,
  status,
  trackingId,
  deliveryDate,
}) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
    );
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

  const orderWithPublicId = await ensureOrderPublicId(order);

  const notificationEmail = normalizeEmail(
    orderWithPublicId.userId?.email || orderWithPublicId.email || "",
  );
  if (notificationEmail) {
    await addEmailJob({
      to: notificationEmail,
      template: "orderStatus",
      data: {
        name:
          orderWithPublicId.userId?.name ||
          orderWithPublicId.customerName ||
          "Customer",
        order: serializeOrder(orderWithPublicId),
      },
    });
  }
  logger.info("Order status updated", {
    orderId:
      orderWithPublicId.publicOrderId ||
      orderWithPublicId.id ||
      orderWithPublicId._id?.toString?.(),
    status,
    trackingId: trackingId || "",
  });

  return serializeOrder(orderWithPublicId);
};
