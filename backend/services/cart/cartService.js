import mongoose from "mongoose";
import logger from "../../config/logger.js";
import Product from "../../models/Product.js";
import { ApiError } from "../../middlewares/errorMiddleware.js";
import { findRawCartByUserId, upsertCart } from "../../repositories/cartRepository.js";
import { normalizeSelectedVariant, resolveProductVariant } from "../pricingService.js";
import { addMoney, multiplyMoney, normalizeMoney, subtractMoney } from "../../utils/money.js";

const getEmptyCart = (userId = "") => ({
  id: "",
  userId: String(userId || ""),
  items: [],
  products: [],
  totalItems: 0,
  subtotal: 0,
  discount: 0,
  finalTotal: 0,
  createdAt: null,
  updatedAt: null,
});

const toObjectIdString = (value) => String(value || "").trim();
const toPositiveInteger = (value) => Math.max(1, Math.trunc(Number(value || 1)) || 1);
const getVariantKey = ({ productId, selectedVariant }) =>
  `${String(productId)}:${String(selectedVariant?.size || "").trim().toLowerCase()}`;

const toPlainItem = (item) => {
  const plain = typeof item?.toObject === "function" ? item.toObject() : item;

  return {
    _id: plain?._id?.toString?.() || plain?._id || undefined,
    productId: plain?.productId?._id?.toString?.() || plain?.productId?.toString?.() || plain?.productId,
    quantity: Number(plain?.quantity || 1),
    selectedVariant: normalizeSelectedVariant(plain?.selectedVariant || plain?.size),
    priceAtAddition: normalizeMoney(plain?.priceAtAddition ?? 0),
    addedAt: plain?.addedAt ? new Date(plain.addedAt) : new Date(),
    updatedAt: plain?.updatedAt ? new Date(plain.updatedAt) : new Date(),
  };
};

export const normalizeCartItemInput = (item) => {
  const productId = toObjectIdString(item?.productId || item?.product?._id || item?.product?.id);
  if (!mongoose.Types.ObjectId.isValid(productId)) return null;

  return {
    _id:
      item?._id && mongoose.Types.ObjectId.isValid(String(item._id))
        ? String(item._id)
        : undefined,
    productId,
    quantity: toPositiveInteger(item?.quantity),
    selectedVariant: normalizeSelectedVariant(item?.selectedVariant || item?.size),
    priceAtAddition: normalizeMoney(item?.priceAtAddition ?? 0),
    addedAt: item?.addedAt ? new Date(item.addedAt) : undefined,
    updatedAt: item?.updatedAt ? new Date(item.updatedAt) : undefined,
  };
};

export const normalizeCartItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeCartItemInput).filter(Boolean);
};

const mergeDuplicateItems = (items = []) => {
  const byKey = new Map();

  items.forEach((item) => {
    const normalized = normalizeCartItemInput(item);
    if (!normalized) return;

    const key = getVariantKey(normalized);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, normalized);
      return;
    }

    byKey.set(key, {
      ...existing,
      quantity: existing.quantity + normalized.quantity,
      priceAtAddition: existing.priceAtAddition || normalized.priceAtAddition,
      addedAt:
        existing.addedAt && normalized.addedAt
          ? new Date(Math.min(existing.addedAt.getTime(), normalized.addedAt.getTime()))
          : existing.addedAt || normalized.addedAt,
      updatedAt: new Date(),
    });
  });

  return Array.from(byKey.values());
};

const buildCartState = async (items = []) => {
  if (!items.length) {
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      finalTotal: 0,
    };
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "name brand category price originalPrice image images sizes stock description isLatest isBestseller",
  );
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const preparedItems = [];
  let subtotal = 0;
  let totalItems = 0;

  for (const item of items) {
    const product = productMap.get(String(item.productId));
    if (!product) {
      continue;
    }

    const availableStock = Math.max(0, Number(product.stock || 0));
    if (availableStock < 1) {
      continue;
    }

    const { selectedVariant, price } = resolveProductVariant(product, item.selectedVariant);
    const quantity = Math.min(toPositiveInteger(item.quantity), availableStock);

    totalItems += quantity;
    subtotal = addMoney(subtotal, multiplyMoney(price, quantity));
    preparedItems.push({
      _id: item._id && mongoose.Types.ObjectId.isValid(String(item._id))
        ? new mongoose.Types.ObjectId(String(item._id))
        : new mongoose.Types.ObjectId(),
      productId: product._id,
      quantity,
      selectedVariant,
      priceAtAddition: normalizeMoney(item.priceAtAddition || price),
      addedAt: item.addedAt || new Date(),
      updatedAt: new Date(),
    });
  }

  const roundedSubtotal = normalizeMoney(subtotal);

  return {
    items: preparedItems,
    totalItems,
    subtotal: roundedSubtotal,
    discount: 0,
    finalTotal: roundedSubtotal,
  };
};

export const serializeCart = (cart) => {
  if (!cart) return getEmptyCart();

  const raw = typeof cart.toObject === "function" ? cart.toObject({ virtuals: true }) : cart;
  const items = Array.isArray(raw.items)
    ? raw.items
        .map((item) => {
          const product = item.productId;
          if (!product || !product._id) return null;

          const rawProduct =
            typeof product.toObject === "function" ? product.toObject({ virtuals: true }) : product;
          const { selectedVariant, size, price } = resolveProductVariant(
            rawProduct,
            item.selectedVariant,
          );
          const quantity = Number(item.quantity || 1);

          return {
            id: item._id?.toString?.() || item._id || "",
            key: `${rawProduct._id}:${size}`,
            productId: rawProduct.id || rawProduct._id?.toString?.() || String(rawProduct._id),
            product: {
              ...rawProduct,
              id: rawProduct.id || rawProduct._id?.toString?.() || String(rawProduct._id),
            },
            quantity,
            selectedVariant,
            size: { size, price },
            priceAtAddition: normalizeMoney(item.priceAtAddition || price),
            currentPrice: normalizeMoney(price),
            lineTotal: multiplyMoney(price, quantity),
            addedAt: item.addedAt || null,
            updatedAt: item.updatedAt || null,
          };
        })
        .filter(Boolean)
    : [];

  return {
    id: raw._id?.toString?.() || raw._id || "",
    userId: raw.userId?.toString?.() || raw.userId || "",
    items,
    products: items,
    totalItems: Number(raw.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0)),
    subtotal: normalizeMoney(
      raw.subtotal ?? addMoney(...items.map((item) => item.lineTotal)),
    ),
    discount: normalizeMoney(raw.discount ?? 0),
    finalTotal: normalizeMoney(
      raw.finalTotal ?? subtractMoney(raw.subtotal ?? 0, raw.discount ?? 0),
    ),
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
  };
};

const persistCart = async ({ userId, items }) => {
  const state = await buildCartState(mergeDuplicateItems(items));
  const cart = await upsertCart({ userId, ...state });
  return serializeCart(cart);
};

const recalculatePersistedCart = async (userId) => {
  const existing = await findRawCartByUserId(userId);
  if (!existing) return getEmptyCart(userId);

  return persistCart({
    userId,
    items: (existing.items || []).map(toPlainItem),
  });
};

export const getCart = async (userId) => {
  const cart = await recalculatePersistedCart(userId);
  logger.info("Cart retrieved", { userId: String(userId), totalItems: cart.totalItems });
  return cart;
};

export const syncCart = async ({ userId, items }) => {
  const cart = await persistCart({ userId, items: normalizeCartItems(items) });
  logger.info("Cart synchronized", { userId: String(userId), totalItems: cart.totalItems });
  return cart;
};

export const mergeGuestCart = async ({ userId, guestItems = [] }) => {
  const existing = await findRawCartByUserId(userId);
  const mergedItems = mergeDuplicateItems([
    ...((existing?.items || []).map(toPlainItem)),
    ...normalizeCartItems(guestItems),
  ]);

  const cart = await persistCart({ userId, items: mergedItems });
  logger.info("Guest cart merged", { userId: String(userId), totalItems: cart.totalItems });
  return cart;
};

export const addCartItem = async ({ userId, item }) => {
  const normalized = normalizeCartItemInput(item);
  if (!normalized) {
    throw new ApiError(422, "Valid cart item is required");
  }

  const product = await Product.findById(normalized.productId).select("name stock sizes price");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (Number(product.stock || 0) < 1) {
    throw new ApiError(400, `${product.name} is currently out of stock`);
  }

  const existing = await findRawCartByUserId(userId);
  const mergedItems = mergeDuplicateItems([
    ...((existing?.items || []).map(toPlainItem)),
    normalized,
  ]);
  const cart = await persistCart({ userId, items: mergedItems });
  logger.info("Cart item added", {
    userId: String(userId),
    productId: normalized.productId,
    quantity: normalized.quantity,
  });
  return cart;
};

export const updateCartItem = async ({ userId, itemId, productId, selectedVariant, quantity }) => {
  const existing = await findRawCartByUserId(userId);
  if (!existing) {
    throw new ApiError(404, "Cart not found");
  }

  const variant = normalizeSelectedVariant(selectedVariant);
  const nextQuantity = Math.max(0, Math.trunc(Number(quantity || 0)));
  const updatedItems = [];
  let found = false;

  for (const item of existing.items || []) {
    const plain = toPlainItem(item);
    const matchesById = itemId && String(plain._id) === String(itemId);
    const matchesByProduct =
      productId &&
      String(plain.productId) === String(productId) &&
      String(plain.selectedVariant.size || "").toLowerCase() ===
        String(variant.size || "").toLowerCase();

    if (!matchesById && !matchesByProduct) {
      updatedItems.push(plain);
      continue;
    }

    found = true;
    if (nextQuantity > 0) {
      updatedItems.push({
        ...plain,
        quantity: nextQuantity,
        updatedAt: new Date(),
      });
    }
  }

  if (!found) {
    throw new ApiError(404, "Cart item not found");
  }

  const cart = await persistCart({ userId, items: updatedItems });
  logger.info("Cart item updated", {
    userId: String(userId),
    itemId: String(itemId || ""),
    productId: String(productId || ""),
    quantity: nextQuantity,
  });
  return cart;
};

export const removeCartItem = async ({ userId, itemId, productId, selectedVariant }) => {
  const existing = await findRawCartByUserId(userId);
  if (!existing) {
    return getEmptyCart(userId);
  }

  const variant = normalizeSelectedVariant(selectedVariant);
  const filteredItems = (existing.items || [])
    .map(toPlainItem)
    .filter((item) => {
      if (itemId) {
        return String(item._id) !== String(itemId);
      }

      if (!productId) {
        return true;
      }

      return !(
        String(item.productId) === String(productId) &&
        String(item.selectedVariant.size || "").toLowerCase() ===
          String(variant.size || "").toLowerCase()
      );
    });

  const cart = await persistCart({ userId, items: filteredItems });
  logger.info("Cart item removed", {
    userId: String(userId),
    itemId: String(itemId || ""),
    productId: String(productId || ""),
  });
  return cart;
};

export const clearCart = async (userId) => {
  const cart = await persistCart({ userId, items: [] });
  logger.info("Cart cleared", { userId: String(userId) });
  return cart;
};
