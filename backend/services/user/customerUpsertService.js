import User from "../../models/User.js";
import logger from "../../config/logger.js";
import { normalizeMoney } from "../../utils/money.js";

const GUEST_EMAIL_DOMAIN = "guest.purefumes.local";

const normalizeEmail = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeMobile = (value = "") => String(value || "").trim();

const buildGuestEmail = ({ email = "", mobileNumber = "", customerName = "" } = {}) => {
  if (email) return email;

  const mobileToken = normalizeMobile(mobileNumber).replace(/[^0-9a-z]/gi, "").toLowerCase();
  const nameToken = String(customerName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const identity = mobileToken || nameToken || `guest-${Date.now()}`;
  return `${identity}@${GUEST_EMAIL_DOMAIN}`;
};

const isGeneratedGuestEmail = (value = "") =>
  normalizeEmail(value).endsWith(`@${GUEST_EMAIL_DOMAIN}`);

const buildAddressString = (shippingAddress = {}, fallbackAddress = "") =>
  String(
    [
      shippingAddress.line1,
      shippingAddress.line2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postalCode,
      shippingAddress.country,
    ]
      .filter(Boolean)
      .join(", ") || fallbackAddress || "",
  ).trim();

const buildStructuredAddress = (orderData = {}, { customerName = "", mobileNumber = "" } = {}) => {
  const shippingAddress = orderData.shippingAddress || {};
  const line1 = String(shippingAddress.line1 || orderData.address || "").trim();

  if (!line1) {
    return null;
  }

  return {
    label: "Latest Order",
    fullName: String(shippingAddress.fullName || customerName || "").trim(),
    mobile: normalizeMobile(shippingAddress.mobile || mobileNumber),
    line1,
    line2: String(shippingAddress.line2 || "").trim(),
    city: String(shippingAddress.city || "Hyderabad").trim(),
    state: String(shippingAddress.state || "Telangana").trim(),
    postalCode: String(shippingAddress.postalCode || "").trim(),
    country: String(shippingAddress.country || "India").trim(),
    isDefault: true,
  };
};

const addressIdentity = (address = {}) =>
  [
    String(address.line1 || "").trim().toLowerCase(),
    String(address.line2 || "").trim().toLowerCase(),
    String(address.city || "").trim().toLowerCase(),
    String(address.state || "").trim().toLowerCase(),
    String(address.postalCode || "").trim().toLowerCase(),
  ].join("|");

const mergeAddresses = (existingAddresses = [], nextAddress = null) => {
  const normalizedExisting = Array.isArray(existingAddresses)
    ? existingAddresses
        .map((address) => ({
          ...address,
          label: String(address?.label || "Saved address").trim() || "Saved address",
          fullName: String(address?.fullName || "").trim(),
          mobile: normalizeMobile(address?.mobile),
          line1: String(address?.line1 || "").trim(),
          line2: String(address?.line2 || "").trim(),
          city: String(address?.city || "").trim(),
          state: String(address?.state || "").trim(),
          postalCode: String(address?.postalCode || "").trim(),
          country: String(address?.country || "India").trim(),
        }))
        .filter((address) => address.line1)
    : [];

  if (!nextAddress) {
    return normalizedExisting.map((address, index) => ({
      ...address,
      isDefault: index === 0,
    }));
  }

  const dedupeKey = addressIdentity(nextAddress);
  const merged = [
    nextAddress,
    ...normalizedExisting.filter((address) => addressIdentity(address) !== dedupeKey),
  ].slice(0, 5);

  return merged.map((address, index) => ({
    ...address,
    isDefault: index === 0,
  }));
};

const buildCustomerSearchFilter = ({ email = "", mobileNumber = "" } = {}) => {
  const identityClauses = [];

  if (email) {
    identityClauses.push({ email });
  }

  if (mobileNumber) {
    identityClauses.push({ mobile: mobileNumber }, { mobileNumber });
  }

  if (!identityClauses.length) {
    return null;
  }

  return {
    role: "user",
    ...(identityClauses.length === 1 ? identityClauses[0] : { $or: identityClauses }),
  };
};

const findCustomer = ({ searchFilter, session }) =>
  session
    ? User.findOne(searchFilter).session(session)
    : User.findOne(searchFilter);

/**
 * Upsert a customer record based on order data.
 * Creates or updates a user-style customer record without requiring auth.
 */
export const upsertGuestCustomer = async (
  orderData = {},
  orderAmount = 0,
  options = {},
) => {
  const session = options?.session || null;
  const email = normalizeEmail(orderData.email);
  const mobileNumber = normalizeMobile(orderData.mobileNumber || orderData.mobile);
  const customerName = String(orderData.customerName || "").trim();
  const address = buildAddressString(
    orderData.shippingAddress || {},
    String(orderData.address || "").trim(),
  );
  const structuredAddress = buildStructuredAddress(orderData, {
    customerName,
    mobileNumber,
  });
  const normalizedOrderAmount = normalizeMoney(orderAmount);
  const searchFilter = buildCustomerSearchFilter({ email, mobileNumber });
  const now = options?.orderDate instanceof Date ? options.orderDate : new Date();

  if (!searchFilter) {
    return null;
  }

  try {
    const existingCustomer = await findCustomer({ searchFilter, session });

    if (existingCustomer) {
      const updateData = {
        $inc: {
          totalOrders: 1,
          totalSpent: normalizedOrderAmount,
        },
        $set: {
          lastOrderDate: now,
          customerName:
            customerName || existingCustomer.customerName || existingCustomer.name || "Guest Customer",
          mobileNumber:
            mobileNumber || existingCustomer.mobileNumber || existingCustomer.mobile || "",
          address: address || existingCustomer.address || "",
          isTestData: Boolean(existingCustomer.isTestData || orderData.isTestData),
        },
      };

      if (customerName && (!existingCustomer.name || isGeneratedGuestEmail(existingCustomer.email))) {
        updateData.$set.name = customerName;
      }

      if (mobileNumber && !existingCustomer.mobile) {
        updateData.$set.mobile = mobileNumber;
      }

      if (email && (!existingCustomer.email || isGeneratedGuestEmail(existingCustomer.email))) {
        updateData.$set.email = email;
      }

      const nextAddresses = mergeAddresses(existingCustomer.addresses, structuredAddress);
      if (nextAddresses.length) {
        updateData.$set.addresses = nextAddresses;
      }

      const updated = session
        ? await User.findByIdAndUpdate(existingCustomer._id, updateData, {
            new: true,
            runValidators: false,
            session,
          })
        : await User.findByIdAndUpdate(existingCustomer._id, updateData, {
            new: true,
            runValidators: false,
          });

      logger.info("Guest customer updated", {
        customerId: existingCustomer._id.toString(),
        email,
        mobileNumber,
        totalOrders: updated?.totalOrders || 0,
        totalSpent: updated?.totalSpent || 0,
      });

      return updated;
    }

    const addresses = mergeAddresses([], structuredAddress);
    const newCustomer = new User({
      name: customerName || "Guest Customer",
      customerName: customerName || "Guest Customer",
      email: buildGuestEmail({ email, mobileNumber, customerName }),
      mobile: mobileNumber || undefined,
      mobileNumber,
      address,
      addresses,
      role: "user",
      totalOrders: 1,
      totalSpent: normalizedOrderAmount,
      lastOrderDate: now,
      emailVerified: false,
      isTestData: Boolean(orderData.isTestData),
    });

    const saved = session
      ? await newCustomer.save({ session })
      : await newCustomer.save();

    logger.info("New guest customer created", {
      customerId: saved._id.toString(),
      email,
      mobileNumber,
      totalOrders: 1,
      totalSpent: normalizedOrderAmount,
    });

    return saved;
  } catch (error) {
    if (error?.code === 11000) {
      const retriedCustomer = await findCustomer({ searchFilter, session });

      if (retriedCustomer) {
        return upsertGuestCustomer(orderData, normalizedOrderAmount, {
          ...options,
          session,
          orderDate: now,
        });
      }
    }

    logger.error("Failed to upsert guest customer", {
      error: error.message,
      email,
      mobileNumber,
      orderAmount: normalizedOrderAmount,
    });
    return null;
  }
};
