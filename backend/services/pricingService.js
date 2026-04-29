import mongoose from "mongoose";
import Product from "../models/Product.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

export const normalizeOrderItems = (body) => {
  if (Array.isArray(body?.items) && body.items.length > 0) {
    return body.items;
  }

  if (Array.isArray(body) && body.length > 0) {
    return body;
  }

  return [];
};

export const getOrderItemPrice = (product, item) => {
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
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new ApiError(400, "Invalid product id in order item");
    }

    const quantity = normalizeQuantity(item.quantity);
    if (quantity < 1) {
      throw new ApiError(400, "Order item quantity must be at least 1");
    }

    let product;

    if (reserveStock) {
      product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, session },
      );

      if (!product) {
        const existingProduct = await getExistingProduct(item.productId, session);
        const message = existingProduct
          ? `Insufficient stock for ${existingProduct.name}`
          : "Product not found";
        throw new ApiError(400, message);
      }
    } else {
      const productQuery = Product.findById(item.productId);
      product = session ? await productQuery.session(session) : await productQuery;

      if (!product) {
        throw new ApiError(400, "Product not found");
      }

      if (requireAvailableStock && product.stock < quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }
    }

    const price = getOrderItemPrice(product, item);

    if (!Number.isFinite(price) || price < 0) {
      throw new ApiError(400, `Invalid price configured for ${product.name}`);
    }

    subtotalAmount += price * quantity;

    preparedItems.push({
      productId: product._id,
      productName: product.name,
      brand: product.brand,
      quantity,
      price,
      size: String(item.size || "").trim(),
    });
  }

  return {
    preparedItems,
    subtotalAmount,
  };
};
