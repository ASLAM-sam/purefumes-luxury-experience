import { calculateCheckoutTotals } from "../services/checkoutTotals.js";

describe("Checkout totals", () => {
  it.each([
    { subtotal: 2000, discount: 500, finalPayable: 1600, shipping: 100 },
    { subtotal: 3000, discount: 500, finalPayable: 2500, shipping: 0 },
    { subtotal: 1230, discount: 1230, finalPayable: 100, shipping: 100 },
  ])(
    "applies coupon only to product subtotal for subtotal $subtotal and discount $discount",
    ({ subtotal, discount, finalPayable, shipping }) => {
      const totals = calculateCheckoutTotals({
        subtotalAmount: subtotal,
        discountAmount: discount,
      });

      expect(totals.subtotalAmount).toBe(subtotal);
      expect(totals.shippingCharge).toBe(shipping);
      expect(totals.totalBeforeDiscount).toBe(subtotal + shipping);
      expect(totals.discountAmount).toBe(discount);
      expect(totals.totalAmount).toBe(finalPayable);
    },
  );
});
