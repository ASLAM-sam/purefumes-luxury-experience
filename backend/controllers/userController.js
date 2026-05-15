import { asyncHandler } from "../middlewares/errorMiddleware.js";
import { getPagination, createPaginationMeta } from "../utils/apiFeatures.js";
import {
  addUserAddress,
  addWishlistProduct,
  clearUserWishlist,
  deleteUserAddress,
  getUserDashboard,
  getUserProfile,
  getUserWishlist,
  removeWishlistProduct,
  setDefaultUserAddress,
  updateUserAddress,
  updateUserProfile,
} from "../services/user/userService.js";
import { getUserOrders } from "../services/orders/orderService.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: await getUserProfile(req.user) } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile({ user: req.user, payload: req.body });
  res.json({ success: true, data: { user } });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getUserDashboard({
    user: req.user,
    recentLimit: Math.min(Number(req.query.recentLimit || 5), 10),
  });
  res.json({ success: true, data: dashboard });
});

export const getProfileOrders = asyncHandler(async (req, res) => {
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

export const getProfileWishlist = asyncHandler(async (req, res) => {
  const products = await getUserWishlist(req.user._id);
  res.json({ success: true, data: products });
});

export const createAddress = asyncHandler(async (req, res) => {
  const user = await addUserAddress({ user: req.user, payload: req.body });
  res.status(201).json({ success: true, data: { user } });
});

export const editAddress = asyncHandler(async (req, res) => {
  const user = await updateUserAddress({
    user: req.user,
    addressId: req.params.addressId,
    payload: req.body,
  });
  res.json({ success: true, data: { user } });
});

export const removeAddress = asyncHandler(async (req, res) => {
  const user = await deleteUserAddress({ user: req.user, addressId: req.params.addressId });
  res.json({ success: true, data: { user } });
});

export const makeDefaultAddress = asyncHandler(async (req, res) => {
  const user = await setDefaultUserAddress({ user: req.user, addressId: req.params.addressId });
  res.json({ success: true, data: { user } });
});

export const addWishlistItem = asyncHandler(async (req, res) => {
  const products = await addWishlistProduct({ user: req.user, productId: req.params.productId });
  res.status(201).json({ success: true, data: products });
});

export const removeWishlistItem = asyncHandler(async (req, res) => {
  const products = await removeWishlistProduct({ user: req.user, productId: req.params.productId });
  res.json({ success: true, data: products });
});

export const clearWishlist = asyncHandler(async (req, res) => {
  const products = await clearUserWishlist(req.user);
  res.json({ success: true, data: products });
});
