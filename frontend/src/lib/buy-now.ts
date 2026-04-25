import type { Product, Size } from "@/data/products";

export type BuyNowCustomer = {
  name: string;
  phone: string;
  address: string;
};

export type BuyNowState = {
  buyNowProduct?: Product;
  buyNowSize?: Size;
};

export type BuyNowSuccessState = BuyNowState & {
  buyNowQuantity?: number;
  buyNowCustomer?: BuyNowCustomer;
  buyNowPaymentMethod?: string;
  buyNowPaymentId?: string;
  buyNowPaymentGateway?: string;
  buyNowOrderId?: string;
};

export const paymentOptions = [
  {
    id: "paytm",
    name: "Paytm",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Paytm%20Logo%20%28standalone%29.svg",
  },
  {
    id: "gpay",
    name: "Google Pay",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Google%20Pay%20Logo%20%282020%29.svg",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/PhonePe%20Logo.svg",
  },
] as const;

export type PaymentOption = (typeof paymentOptions)[number];
