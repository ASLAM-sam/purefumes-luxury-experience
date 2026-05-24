import type { Product, Size } from "@/data/products";

export type BuyNowCustomer = {
  name: string;
  phone: string;
  alternatePhone?: string;
  houseNumber?: string;
  building?: string;
  area?: string;
  landmark1?: string;
  landmark2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  deliveryInstructions?: string;
  preferredDeliveryTime?: string;
  address: string;
};

export type BuyNowState = {
  buyNowProduct?: Product;
  buyNowSize?: Size;
};

export type OrderSuccessItem = {
  productId?: string;
  productName: string;
  brand?: string;
  quantity: number;
  size?: string;
  price?: number;
  productImage?: string;
};

export type BuyNowSuccessState = BuyNowState & {
  buyNowQuantity?: number;
  buyNowOrderItems?: OrderSuccessItem[];
  buyNowCustomer?: BuyNowCustomer;
  buyNowPaymentMethod?: string;
  buyNowPaymentId?: string;
  buyNowPaymentOrderId?: string;
  buyNowPaymentGateway?: string;
  buyNowPaymentStatus?: string;
  buyNowOrderStatus?: string;
  buyNowOrderId?: string;
  buyNowPublicOrderId?: string;
  buyNowOrderDate?: string;
  buyNowCouponCode?: string;
  buyNowSubtotal?: number;
  buyNowDiscount?: number;
  buyNowFinalTotal?: number;
  buyNowShouldOpenWhatsApp?: boolean;
};

const BUY_NOW_CHECKOUT_STORAGE_KEY = "purefumes_buy_now_checkout";
const BUY_NOW_SUCCESS_STORAGE_KEY = "purefumes_buy_now_success";

const readStorageState = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as T) : null;
  } catch (_error) {
    return null;
  }
};

const writeStorageState = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
    // Buy-now persistence should not block checkout flow.
  }
};

const clearStorageState = (key: string) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(key);
  } catch (_error) {
    // Cleanup should never interrupt navigation.
  }
};

export const getBuyNowCheckoutState = (): BuyNowState =>
  readStorageState<BuyNowState>(BUY_NOW_CHECKOUT_STORAGE_KEY) || {};

export const saveBuyNowCheckoutState = (state: BuyNowState) => {
  writeStorageState(BUY_NOW_CHECKOUT_STORAGE_KEY, state);
};

export const clearBuyNowCheckoutState = () => {
  clearStorageState(BUY_NOW_CHECKOUT_STORAGE_KEY);
};

export const getBuyNowSuccessState = (): BuyNowSuccessState =>
  readStorageState<BuyNowSuccessState>(BUY_NOW_SUCCESS_STORAGE_KEY) || {};

export const saveBuyNowSuccessState = (state: BuyNowSuccessState) => {
  writeStorageState(BUY_NOW_SUCCESS_STORAGE_KEY, state);
};

export const clearBuyNowSuccessState = () => {
  clearStorageState(BUY_NOW_SUCCESS_STORAGE_KEY);
};

export const paymentOptions = [
  {
    id: "paytm",
    name: "Paytm",
    logo: "/payment-logos/paytm.svg",
  },
  {
    id: "gpay",
    name: "Google Pay",
    logo: "/payment-logos/gpay.svg",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    logo: "/payment-logos/phonepe.svg",
  },
] as const;

export type PaymentOption = (typeof paymentOptions)[number];
