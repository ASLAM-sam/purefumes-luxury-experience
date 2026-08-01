import mongoose from "mongoose";
import env from "../config/env.js";
import logger from "../config/logger.js";
import BackInStockNotification from "../models/BackInStockNotification.js";
import Product from "../models/Product.js";
import { addEmailJob } from "../queues/emailQueue.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

const ACTIVE_STATUSES = ["pending", "queued"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const normalizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);

const getClientIp = (req) =>
  String(req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();

const productSlugFor = (product) =>
  String(product?.slug || product?.categorySlug || product?._id || product?.id || "").trim();

const buildProductUrl = (product, fallbackUrl = env.FRONTEND_URL) => {
  const base = String(fallbackUrl || "").replace(/\/$/, "");
  if (!base) return "";

  const productId = String(product?._id || product?.id || "").trim();
  const productSlug = String(product?.slug || product?.categorySlug || "").trim();

  if (productSlug) {
    return `${base}/product/${encodeURIComponent(productSlug)}`;
  }

  if (productId) {
    return `${base}/product/${productId}`;
  }

  return base;
};

export const normalizeBackInStockNotification = (notification) => {
  if (!notification) return null;
  const plain = typeof notification.toObject === "function"
    ? notification.toObject({ virtuals: true })
    : notification;

  return {
    ...plain,
    id: String(plain.id || plain._id || ""),
    productId: String(plain.productId?._id || plain.productId || ""),
    product:
      plain.productId && typeof plain.productId === "object"
        ? {
            id: String(plain.productId._id || plain.productId.id || ""),
            name: plain.productId.name || plain.productName || "",
            image: plain.productId.image || plain.productId.images?.[0] || "",
            price: Number(plain.productId.price || 0),
            stock: Number(plain.productId.stock || 0),
          }
        : undefined,
    email: String(plain.email || "").trim().toLowerCase(),
    phone: String(plain.phone || "").trim(),
    status: plain.status || "pending",
  };
};

export const createBackInStockSubscription = async ({ productId, email, phone, req }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Valid product id is required");
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    throw new ApiError(422, "Please enter a valid email address.");
  }

  if (!normalizedPhone || !phonePattern.test(normalizedPhone)) {
    throw new ApiError(422, "Please enter a valid 10-digit mobile number.");
  }

  const product = await Product.findById(productId).select("name image images price stock").lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (Number(product.stock || 0) > 0) {
    return {
      notification: null,
      alreadySubscribed: false,
      message: "This product is already available.",
    };
  }

  const existing = await BackInStockNotification.findOne({
    productId,
    email: normalizedEmail,
    status: { $in: ACTIVE_STATUSES },
  });

  if (existing) {
    return {
      notification: normalizeBackInStockNotification(existing),
      alreadySubscribed: true,
      message: "You've already subscribed for this product.",
    };
  }

  try {
    const notification = await BackInStockNotification.create({
      productId,
      productName: product.name,
      productSlug: productSlugFor(product),
      email: normalizedEmail,
      phone: normalizedPhone,
      status: "pending",
      ipAddress: req ? getClientIp(req) : "",
      userAgent: String(req?.headers?.["user-agent"] || "").slice(0, 500),
    });

    return {
      notification: normalizeBackInStockNotification(notification),
      alreadySubscribed: false,
      message: "We'll notify you as soon as this product is back in stock.",
    };
  } catch (error) {
    if (error?.code === 11000) {
      const notification = await BackInStockNotification.findOne({
        productId,
        email: normalizedEmail,
        status: { $in: ACTIVE_STATUSES },
      });

      return {
        notification: normalizeBackInStockNotification(notification),
        alreadySubscribed: true,
        message: "You've already subscribed for this product.",
      };
    }

    throw error;
  }
};

export const listBackInStockNotifications = async ({
  page = 1,
  limit = 20,
  status = "",
  search = "",
} = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  const normalizedSearch = String(search || "").trim();
  if (normalizedSearch) {
    const pattern = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(pattern, "i");
    filter.$or = [{ productName: regex }, { email: regex }, { phone: regex }];
  }

  const [notifications, total] = await Promise.all([
    BackInStockNotification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("productId", "name image images price stock")
      .lean({ virtuals: true }),
    BackInStockNotification.countDocuments(filter),
  ]);

  return {
    notifications: notifications.map(normalizeBackInStockNotification),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

export const queueBackInStockNotificationsForProduct = async (product) => {
  if (!product?._id) return { queued: 0, failed: 0 };

  const productId = product._id;
  const notifications = await BackInStockNotification.find({
    productId,
    status: "pending",
  }).select("_id email productId productName productSlug");

  let queued = 0;
  let failed = 0;

  for (const notification of notifications) {
    const claimed = await BackInStockNotification.findOneAndUpdate(
      { _id: notification._id, status: "pending" },
      { status: "queued", lastAttemptAt: new Date() },
      { new: true },
    );

    if (!claimed) {
      continue;
    }

    try {
      const job = await addEmailJob({
        to: claimed.email,
        template: "backInStock",
        data: {
          product: {
            id: String(product._id),
            name: product.name,
            image: product.image || product.images?.[0] || "",
            price: product.price,
            stock: product.stock,
            url: buildProductUrl(product, env.FRONTEND_URL),
          },
          customerName: "there",
        },
        metadata: {
          backInStockNotificationId: String(claimed._id),
        },
      });

      await BackInStockNotification.updateOne(
        { _id: claimed._id, status: "queued" },
        { $set: { emailJobId: String(job?.id || "") } },
      );
      queued += 1;
    } catch (error) {
      failed += 1;
      claimed.status = "failed";
      claimed.lastAttemptAt = new Date();
      await claimed.save();
      logger.error("Failed to queue back in stock notification", {
        notificationId: String(claimed._id),
        productId: String(productId),
        error: error.message,
      });
    }
  }

  return { queued, failed };
};

export const retryBackInStockNotification = async (notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Valid notification id is required");
  }

  const notification = await BackInStockNotification.findById(notificationId).populate(
    "productId",
    "name image images price stock",
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.status === "sent") {
    throw new ApiError(400, "Sent notifications cannot be retried.");
  }

  if (notification.status === "cancelled") {
    throw new ApiError(400, "Cancelled notifications cannot be retried.");
  }

  const product = notification.productId;
  if (!product || Number(product.stock || 0) <= 0) {
    throw new ApiError(400, "Product is not currently in stock.");
  }

  notification.status = "queued";
  notification.lastAttemptAt = new Date();

  try {
    const job = await addEmailJob({
      to: notification.email,
      template: "backInStock",
      data: {
        product: {
          id: String(product._id),
          name: product.name,
          image: product.image || product.images?.[0] || "",
          price: product.price,
          stock: product.stock,
          url: buildProductUrl(product, env.FRONTEND_URL),
        },
        customerName: "there",
      },
      metadata: {
        backInStockNotificationId: String(notification._id),
      },
    });

    await BackInStockNotification.updateOne(
      { _id: notification._id, status: "queued" },
      { $set: { emailJobId: String(job?.id || "") } },
    );
  } catch (error) {
    notification.status = "failed";
    notification.lastAttemptAt = new Date();
    await notification.save();
    throw error;
  }

  return normalizeBackInStockNotification(
    (await BackInStockNotification.findById(notification._id).populate(
      "productId",
      "name image images price stock",
    )) || notification,
  );
};

export const cancelBackInStockNotification = async (notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Valid notification id is required");
  }

  const notification = await BackInStockNotification.findOneAndUpdate(
    {
      _id: notificationId,
      status: { $in: ["pending", "queued", "failed"] },
    },
    { status: "cancelled" },
    { new: true },
  );

  if (!notification) {
    throw new ApiError(404, "Active notification not found");
  }

  return normalizeBackInStockNotification(notification);
};

export const markBackInStockNotificationSent = async (notificationId, emailJobId = "") => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) return;

  await BackInStockNotification.findByIdAndUpdate(notificationId, {
    status: "sent",
    sentAt: new Date(),
    lastAttemptAt: new Date(),
    ...(emailJobId ? { emailJobId: String(emailJobId) } : {}),
  });
};

export const markBackInStockNotificationFailed = async (notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) return;

  await BackInStockNotification.findByIdAndUpdate(notificationId, {
    status: "failed",
    lastAttemptAt: new Date(),
  });
};
