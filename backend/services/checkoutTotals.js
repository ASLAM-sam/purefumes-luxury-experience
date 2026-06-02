import {
  addMoney,
  normalizeMoney,
  subtractMoney,
} from "../utils/money.js";

export const SHIPPING_THRESHOLD = 2499;
export const SHIPPING_CHARGE = 100;

export const calculateShippingCharge = (subtotalAmount = 0) =>
  normalizeMoney(subtotalAmount) < SHIPPING_THRESHOLD ? SHIPPING_CHARGE : 0;

export const calculateCheckoutTotals = ({
  subtotalAmount = 0,
  discountAmount = 0,
} = {}) => {
  const subtotal = normalizeMoney(subtotalAmount);
  const shippingCharge = calculateShippingCharge(subtotal);
  const totalBeforeDiscount = normalizeMoney(addMoney(subtotal, shippingCharge));
  const discount = normalizeMoney(Math.min(normalizeMoney(discountAmount), subtotal));
  const totalAfterProductDiscount = normalizeMoney(subtractMoney(subtotal, discount));
  const totalAmount = normalizeMoney(addMoney(totalAfterProductDiscount, shippingCharge));

  return {
    subtotalAmount: subtotal,
    shippingCharge,
    totalBeforeDiscount,
    discountAmount: discount,
    totalAmount: normalizeMoney(totalAmount),
  };
};
