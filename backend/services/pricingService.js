import mongoose from "mongoose";
import Product from "../models/Product.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { addMoney, multiplyMoney, normalizeMoney } from "../utils/money.js";

export const normalizeOrderItems = (body) => {
  if (Array.isArray(body?.items) && body.items.length > 0) {
    return body.items;
  }

  if (Array.isArray(body) && body.length > 0) {
    return body;
  }

  return [];
};

export const normalizeSelectedVariant = (value) => {
  if (typeof value === "string") {
    return { size: value.trim() };
  }

  return {
    size: String(value?.size || value?.label || "").trim(),
  };
};

export const resolveProductVariant = (product, value) => {
  const requestedVariant = normalizeSelectedVariant(value);
  const requestedSize = String(requestedVariant.size || "").trim();
  const availableSizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const matchedSize = requestedSize
    ? availableSizes.find(
        (size) => String(size.size || "").trim().toLowerCase() === requestedSize.toLowerCase(),
      )
    : null;

  if (requestedSize && availableSizes.length > 0 && !matchedSize) {
    throw new ApiError(400, `Selected size "${requestedSize}" is not available for ${product.name}`);
  }

  const fallbackSize = matchedSize || availableSizes[0] || null;
  const selectedSize = String(fallbackSize?.size || requestedSize || "Standard").trim();
  const rawPrice = Number(
    fallbackSize?.price ?? product?.price ?? product?.originalPrice ?? 0,
  );

  if (!Number.isFinite(rawPrice) || rawPrice < 0) {
    throw new ApiError(400, `Invalid price configured for ${product.name}`);
  }

  return {
    selectedVariant: { size: selectedSize },
    size: selectedSize,
    price: normalizeMoney(rawPrice),
  };
};

const normalizeQuantity = (value) => Number.parseInt(value, 10) || 1;

const getExistingProduct = async (productId, session) => {
  const existingProductQuery = Product.findById(productId);
  return session ? existingProductQuery.session(session) : existingProductQuery;
};

export const buildPreparedOrderItems = async (
  rawItems,
  { reserveStock = false, requireAvailableStock = false, session } = {},
) => {
  const items = normalizeOrderItems(rawItems);

  if (!items.length) {
    throw new ApiError(400, "Order items are required");
  }

  const preparedItems = [];
  let subtotalAmount = 0;

  for (const item of items) {
    const productId = item.productId || item._id || item.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid product id in order item");
    }

    const quantity = normalizeQuantity(item.quantity);
    if (quantity < 1) {
      throw new ApiError(400, "Order item quantity must be at least 1");
    }

    let product;

    if (reserveStock) {
      product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, session },
      );

      if (!product) {
        const existingProduct = await getExistingProduct(productId, session);
        const message = existingProduct
          ? `Insufficient stock for ${existingProduct.name}`
          : "Product not found";
        throw new ApiError(400, message);
      }
    } else {
      const productQuery = Product.findById(productId);
      product = session ? await productQuery.session(session) : await productQuery;

      if (!product) {
        throw new ApiError(400, "Product not found");
      }

      if (requireAvailableStock && product.stock < quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }
    }

    const { size, price } = resolveProductVariant(
      product,
      item.selectedVariant || item.size,
    );

    subtotalAmount = addMoney(subtotalAmount, multiplyMoney(price, quantity));

    preparedItems.push({
      productId: product._id,
      productName: product.name,
      brand: product.brand,
      quantity,
      price,
      priceAtPurchase: price,
      productImage: product.image || product.images?.[0] || "",
      size,
    });
  }

  return {
    preparedItems,
    subtotalAmount,
  };
};
