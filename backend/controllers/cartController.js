import { asyncHandler } from "../middlewares/errorMiddleware.js";
import {
  addCartItem,
  clearCart,
  getCart,
  mergeGuestCart,
  removeCartItem,
  syncCart,
  updateCartItem,
} from "../services/cart/cartService.js";

export const getMyCart = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getCart(req.user._id) });
});

export const mergeCart = asyncHandler(async (req, res) => {
  const cart = await mergeGuestCart({ userId: req.user._id, guestItems: req.body.items || [] });
  res.json({ success: true, data: cart });
});

export const syncMyCart = asyncHandler(async (req, res) => {
  const cart = await syncCart({ userId: req.user._id, items: req.body.items || [] });
  res.json({ success: true, data: cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const cart = await addCartItem({ userId: req.user._id, item: req.body });
  res.status(201).json({ success: true, data: cart });
});

export const updateCart = asyncHandler(async (req, res) => {
  const cart = await updateCartItem({
    userId: req.user._id,
    itemId: req.body.itemId,
    productId: req.body.productId,
    selectedVariant: req.body.selectedVariant || req.body.size,
    quantity: req.body.quantity,
  });
  res.json({ success: true, data: cart });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await removeCartItem({
    userId: req.user._id,
    itemId: req.query.itemId || req.params.id,
    productId: req.query.productId,
    selectedVariant: req.query.size || req.query.selectedVariant,
  });
  res.json({ success: true, data: cart });
});

export const clearMyCart = asyncHandler(async (req, res) => {
  const cart = await clearCart(req.user._id);
  res.json({ success: true, data: cart });
});
