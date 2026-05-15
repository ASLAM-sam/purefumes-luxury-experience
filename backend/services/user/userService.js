import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ApiError } from "../../middlewares/errorMiddleware.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import { aggregateUserOrderSummary } from "../../repositories/orderRepository.js";
import {
  passwordRules,
  passwordValidationMessage,
  serializeUser,
  usernameRules,
  usernameValidationMessage,
} from "../auth/authService.js";
import { getUserOrders } from "../orders/orderService.js";

const MAX_ADDRESSES = 10;
const mobileRules = /^[0-9+\-\s()]{7,25}$/;
const indiaPincodeRules = /^[1-9][0-9]{5}$/;
const generalPostalCodeRules = /^[A-Za-z0-9][A-Za-z0-9 -]{2,19}$/;

const getUserDocument = async (userOrId) => {
  const userId = userOrId?._id || userOrId?.id || userOrId;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const serializeUserWithSummary = (user, summary = {}) => ({
  ...serializeUser(user),
  totalOrders: Number(summary.totalOrders || 0),
  totalSpent: Number(summary.totalSpent || 0),
});

const normalizeAddressInput = ({ address = {}, user, existing = {}, index = 0 }) => {
  const fullName = String(address.fullName ?? existing.fullName ?? user.name ?? "").trim();
  const mobile = String(
    address.mobile ?? address.phone ?? existing.mobile ?? user.mobile ?? "",
  ).trim();
  const line1 = String(
    address.line1 ?? address.street ?? address.address ?? existing.line1 ?? "",
  ).trim();
  const line2 = String(address.line2 ?? address.landmark ?? existing.line2 ?? "").trim();
  const city = String(address.city ?? existing.city ?? "").trim();
  const state = String(address.state ?? existing.state ?? "").trim();
  const postalCode = String(
    address.postalCode ?? address.pincode ?? existing.postalCode ?? "",
  ).trim();
  const country = String(address.country ?? existing.country ?? "India").trim();
  const label = String(address.label ?? existing.label ?? `Address ${index + 1}`).trim();

  if (!fullName) throw new ApiError(422, "Address full name is required");
  if (!mobile || !mobileRules.test(mobile)) throw new ApiError(422, "Address phone number is invalid");
  if (!line1) throw new ApiError(422, "Street address is required");
  if (!city) throw new ApiError(422, "City is required");
  if (!state) throw new ApiError(422, "State is required");
  if (!postalCode) throw new ApiError(422, "Pincode is required");
  if (!country) throw new ApiError(422, "Country is required");
  if (
    country.toLowerCase() === "india" &&
    !indiaPincodeRules.test(postalCode)
  ) {
    throw new ApiError(422, "Pincode must be a valid 6-digit Indian pincode");
  }

  if (
    country.toLowerCase() !== "india" &&
    !generalPostalCodeRules.test(postalCode)
  ) {
    throw new ApiError(422, "Postal code is invalid");
  }

  return {
    label: label || `Address ${index + 1}`,
    fullName,
    mobile,
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
    isDefault:
      address.isDefault !== undefined ? Boolean(address.isDefault) : Boolean(existing.isDefault),
  };
};

const ensureSingleDefaultAddress = (addresses = []) => {
  if (!addresses.length) return [];

  const defaultIndex = addresses.findIndex((address) => address.isDefault);
  const resolvedDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;

  return addresses.map((address, index) => ({
    ...address,
    isDefault: index === resolvedDefaultIndex,
  }));
};

const serializeDashboard = async ({ user, recentLimit = 5 }) => {
  const [summary, ordersResult, wishlist] = await Promise.all([
    aggregateUserOrderSummary(user),
    getUserOrders({ user, page: 1, limit: recentLimit }),
    getUserWishlist(user._id),
  ]);
  const serializedUser = serializeUserWithSummary(user, summary);
  const addresses = Array.isArray(serializedUser.addresses) ? serializedUser.addresses : [];

  return {
    user: serializedUser,
    stats: {
      totalOrders: summary.totalOrders,
      totalSpent: summary.totalSpent,
      wishlistItems: wishlist.length,
      addressCount: addresses.length,
    },
    recentOrders: ordersResult.orders,
    wishlist,
    addresses,
    defaultAddress: addresses.find((address) => address.isDefault) || addresses[0] || null,
  };
};

export const getUserProfile = async (userOrId) => {
  const user = await getUserDocument(userOrId);
  const summary = await aggregateUserOrderSummary(user);
  return serializeUserWithSummary(user, summary);
};

export const getUserDashboard = async ({ user, recentLimit = 5 }) =>
  serializeDashboard({ user: await getUserDocument(user), recentLimit });

export const updateUserProfile = async ({ user, payload }) => {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const username = String(payload.username || "").trim();
  const mobile = String(payload.mobile || payload.phone || "").trim();
  const profileImage = String(payload.profileImage || "").trim();

  if (name) user.name = name;
  if (profileImage) user.profileImage = profileImage;

  if (email && email !== user.email) {
    const existing = await User.findOne({ email, _id: { $ne: user._id } });
    if (existing) throw new ApiError(409, "Email is already registered");
    user.email = email;
    user.emailVerified = false;
  }

  if (username && username !== user.username) {
    if (!usernameRules.test(username)) {
      throw new ApiError(422, usernameValidationMessage);
    }

    const existing = await User.findOne({ username, _id: { $ne: user._id } });
    if (existing) throw new ApiError(409, "Username is already taken");
    user.username = username;
  }

  if (mobile && mobile !== user.mobile) {
    if (!mobileRules.test(mobile)) {
      throw new ApiError(422, "Mobile number is invalid");
    }

    const existing = await User.findOne({ mobile, _id: { $ne: user._id } });
    if (existing) throw new ApiError(409, "Mobile number is already registered");
    user.mobile = mobile;
  }

  if (Array.isArray(payload.addresses)) {
    user.addresses = ensureSingleDefaultAddress(
      payload.addresses
        .slice(0, MAX_ADDRESSES)
        .map((address, index) => normalizeAddressInput({ address, user, index })),
    );
  }

  await user.save();
  return getUserProfile(user);
};

export const getUserWishlist = async (userId) => {
  const user = await User.findById(userId).select("wishlist");
  if (!user) throw new ApiError(404, "User not found");

  const wishlistIds = (user.wishlist || [])
    .map((id) => id?.toString?.() || String(id))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!wishlistIds.length) return [];

  const products = await Product.find({ _id: { $in: wishlistIds } }).lean({ virtuals: true });
  const byId = new Map(products.map((product) => [String(product._id), product]));

  return wishlistIds.map((id) => byId.get(id)).filter(Boolean);
};

export const addUserAddress = async ({ user, payload }) => {
  const freshUser = await getUserDocument(user);

  if (freshUser.addresses.length >= MAX_ADDRESSES) {
    throw new ApiError(422, `You can save up to ${MAX_ADDRESSES} addresses`);
  }

  const address = normalizeAddressInput({
    address: {
      ...payload,
      isDefault: payload.isDefault ?? freshUser.addresses.length === 0,
    },
    user: freshUser,
    index: freshUser.addresses.length,
  });

  freshUser.addresses = ensureSingleDefaultAddress([
    ...freshUser.addresses.map((item) => item.toObject?.() || item),
    address,
  ]);

  await freshUser.save();
  return getUserProfile(freshUser);
};

export const updateUserAddress = async ({ user, addressId, payload }) => {
  const freshUser = await getUserDocument(user);
  const index = freshUser.addresses.findIndex((address) => String(address._id) === String(addressId));

  if (index < 0) throw new ApiError(404, "Address not found");

  const existing = freshUser.addresses[index].toObject?.() || freshUser.addresses[index];
  const nextAddress = normalizeAddressInput({
    address: payload,
    user: freshUser,
    existing,
    index,
  });

  const addresses = freshUser.addresses.map((address, currentIndex) =>
    currentIndex === index ? { ...existing, ...nextAddress, _id: existing._id } : address.toObject?.() || address,
  );

  freshUser.addresses = ensureSingleDefaultAddress(addresses);
  await freshUser.save();
  return getUserProfile(freshUser);
};

export const deleteUserAddress = async ({ user, addressId }) => {
  const freshUser = await getUserDocument(user);
  const targetAddress = freshUser.addresses.find((address) => String(address._id) === String(addressId));

  if (!targetAddress) {
    throw new ApiError(404, "Address not found");
  }

  if (targetAddress.isDefault && freshUser.addresses.length > 1) {
    throw new ApiError(422, "Set another address as default before deleting this one");
  }

  const addresses = freshUser.addresses
    .map((address) => address.toObject?.() || address)
    .filter((address) => String(address._id) !== String(addressId));

  freshUser.addresses = ensureSingleDefaultAddress(addresses);
  await freshUser.save();
  return getUserProfile(freshUser);
};

export const setDefaultUserAddress = async ({ user, addressId }) => {
  const freshUser = await getUserDocument(user);
  let found = false;

  freshUser.addresses = freshUser.addresses.map((address) => {
    const plain = address.toObject?.() || address;
    const isDefault = String(plain._id) === String(addressId);
    if (isDefault) found = true;
    return { ...plain, isDefault };
  });

  if (!found) throw new ApiError(404, "Address not found");

  await freshUser.save();
  return getUserProfile(freshUser);
};

export const addWishlistProduct = async ({ user, productId }) => {
  if (!mongoose.Types.ObjectId.isValid(String(productId))) {
    throw new ApiError(400, "Invalid product id");
  }

  const productExists = await Product.exists({ _id: productId });
  if (!productExists) throw new ApiError(404, "Product not found");

  await User.findByIdAndUpdate(user._id, { $addToSet: { wishlist: productId } });
  return getUserWishlist(user._id);
};

export const removeWishlistProduct = async ({ user, productId }) => {
  if (!mongoose.Types.ObjectId.isValid(String(productId))) {
    throw new ApiError(400, "Invalid product id");
  }

  await User.findByIdAndUpdate(user._id, { $pull: { wishlist: productId } });
  return getUserWishlist(user._id);
};

export const clearUserWishlist = async (user) => {
  await User.findByIdAndUpdate(user._id, { $set: { wishlist: [] } });
  return [];
};

export const changePassword = async ({ user, currentPassword, nextPassword }) => {
  const userWithPassword = await User.findById(user._id).select("+passwordHash +refreshTokens");

  if (!userWithPassword.passwordHash) {
    throw new ApiError(400, "Password login is not enabled for this account");
  }

  const matches = await bcrypt.compare(String(currentPassword || ""), userWithPassword.passwordHash);
  if (!matches) throw new ApiError(401, "Current password is incorrect");

  if (!passwordRules.test(String(nextPassword || ""))) {
    throw new ApiError(422, passwordValidationMessage);
  }

  userWithPassword.passwordHash = await bcrypt.hash(nextPassword, 12);
  userWithPassword.refreshTokens = [];
  await userWithPassword.save();
};
