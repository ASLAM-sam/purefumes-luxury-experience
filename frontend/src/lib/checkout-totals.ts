import { addMoney, normalizeMoney, subtractMoney } from "@/lib/money";

export const SHIPPING_THRESHOLD = 2499;
export const SHIPPING_CHARGE = 100;

export const calculateShippingCharge = (subtotal: unknown) =>
  normalizeMoney(subtotal) < SHIPPING_THRESHOLD ? SHIPPING_CHARGE : 0;

export const calculateCheckoutTotals = ({
  subtotal,
  discount = 0,
}: {
  subtotal: unknown;
  discount?: unknown;
}) => {
  const normalizedSubtotal = normalizeMoney(subtotal);
  const shippingCharge = calculateShippingCharge(normalizedSubtotal);
  const totalBeforeDiscount = normalizeMoney(addMoney(normalizedSubtotal, shippingCharge));
  const discountAmount = normalizeMoney(Math.min(normalizeMoney(discount), normalizedSubtotal));
  const totalAfterProductDiscount = normalizeMoney(subtractMoney(normalizedSubtotal, discountAmount));
  const finalPayable = normalizeMoney(addMoney(totalAfterProductDiscount, shippingCharge));

  return {
    subtotal: normalizedSubtotal,
    shippingCharge,
    totalBeforeDiscount,
    discount: discountAmount,
    finalPayable: normalizeMoney(finalPayable),
  };
};
