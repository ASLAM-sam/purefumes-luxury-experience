import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import Product from "../models/Product.js";
import { ApiError, asyncHandler } from "../middlewares/errorMiddleware.js";
import { clearProductCache } from "./productController.js";
import { createPaginationMeta, getPagination } from "../utils/apiFeatures.js";

const normalizeOrderItems = (body) => {
  if (Array.isArray(body.items) && body.items.length > 0) {
    return body.items;
  }

  return [];
};

const getItemPrice = (product, item) => {
  if (item.size && product.sizes?.length) {
    const selectedSize = product.sizes.find(
      (size) => size.size?.toLowerCase() === String(item.size).toLowerCase(),
    );

    if (selectedSize?.price !== undefined) {
      return Number(selectedSize.price);
    }
  }

  if (product.price !== undefined) {
    return Number(product.price);
  }

  return Number(item.price || 0);
};

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
    items: Array.isArray(raw.items) ? raw.items : [],
  };
};

export const placeOrder = asyncHandler(async (req, res) => {
  const rawItems = normalizeOrderItems(req.body);

  if (!rawItems.length) {
    throw new ApiError(400, "Order items are required");
  }

  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const preparedItems = [];
      let totalAmount = 0;

      for (const item of rawItems) {
        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          throw new ApiError(400, "Invalid product id in order item");
        }

        const quantity = Number.parseInt(item.quantity, 10) || 1;
        if (quantity < 1) {
          throw new ApiError(400, "Order item quantity must be at least 1");
        }

        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session },
        );

        if (!product) {
          const existingProduct = await Product.findById(
            item.productId,
          ).session(session);
          const message = existingProduct
            ? `Insufficient stock for ${existingProduct.name}`
            : "Product not found";
          throw new ApiError(400, message);
        }

        const price = getItemPrice(product, item);
        totalAmount += price * quantity;

        preparedItems.push({
          productId: product._id,
          productName: product.name,
          brand: product.brand,
          quantity,
          price,
          size: item.size,
        });
      }

      const [order] = await Order.create(
        [
          {
            customerName: req.body.customerName,
            phone: req.body.phone,
            address: req.body.address,
            product: preparedItems[0]?.productId,
            productName: preparedItems[0]?.productName || "",
            brand: preparedItems[0]?.brand || "",
            size: preparedItems[0]?.size || "",
            price: preparedItems[0]?.price || totalAmount,
            items: preparedItems,
            totalAmount,
            status: "Pending",
          },
        ],
        { session },
      );

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  clearProductCache();
  res
    .status(201)
    .json({ success: true, data: normalizeOrderResponse(createdOrder) });
});

export const getOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
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

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.json({ success: true, data: normalizeOrderResponse(order) });
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
