import AppSettings from "../models/AppSettings.js";
import env from "../config/env.js";

export const PAYMENT_MODES = ["live", "test"];

const normalizePaymentMode = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  return PAYMENT_MODES.includes(normalized) ? normalized : "";
};

export const getDefaultPaymentMode = () => {
  const configuredMode = normalizePaymentMode(env.PAYMENT_MODE);

  if (configuredMode) {
    return configuredMode;
  }

  return env.BYPASS_PAYMENT ? "test" : "live";
};

export const getPaymentSettings = async () => {
  const settings = await AppSettings.findOne().sort({ createdAt: 1 });

  if (!settings) {
    return {
      paymentMode: getDefaultPaymentMode(),
      isPersisted: false,
    };
  }

  return {
    paymentMode: normalizePaymentMode(settings.paymentMode) || getDefaultPaymentMode(),
    isPersisted: true,
    id: settings._id?.toString?.() || "",
    updatedAt: settings.updatedAt || null,
  };
};

export const getEffectivePaymentMode = async () => {
  const settings = await getPaymentSettings();
  return settings.paymentMode || getDefaultPaymentMode();
};

export const updatePaymentMode = async (paymentMode) => {
  const normalizedMode = normalizePaymentMode(paymentMode) || "live";

  const settings = await AppSettings.findOneAndUpdate(
    {},
    { paymentMode: normalizedMode },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return {
    paymentMode: normalizePaymentMode(settings.paymentMode) || "live",
    isPersisted: true,
    id: settings._id?.toString?.() || "",
    updatedAt: settings.updatedAt || null,
  };
};
