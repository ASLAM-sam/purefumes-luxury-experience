import type { OrderSuccessItem } from "@/lib/buy-now";
import { formatINR } from "@/lib/money";

export const WHATSAPP_PHONE = "918341174677";

export type WhatsAppOrderDetails = {
  customerName: string;
  phone: string;
  orderId: string;
  paymentId: string;
  items: OrderSuccessItem[];
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  orderDate: string;
};

const cleanText = (value: unknown, fallback = "-") => {
  const normalized = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
  return normalized || fallback;
};

const formatOrderDate = (value: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString("en-IN");
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const buildWhatsAppOrderMessage = ({
  customerName,
  phone,
  orderId,
  paymentId,
  items,
  totalAmount,
  deliveryAddress,
  paymentMethod,
  orderDate,
}: WhatsAppOrderDetails) => {
  const productLines = items.length
    ? items
        .map(
          (item) =>
            `- ${cleanText(item.productName, "Product")} × ${item.quantity || 1} × ${
              cleanText(item.size, "Standard")
            }`,
        )
        .join("\n")
    : "- Product details unavailable";

  return [
    "Hello Purefumes Hyderabad,",
    "",
    "A new order has been placed successfully.",
    "",
    `Order ID: ${cleanText(orderId)}`,
    `Payment ID: ${cleanText(paymentId)}`,
    "",
    "Customer Details:",
    `Name: ${cleanText(customerName)}`,
    `Phone: ${cleanText(phone)}`,
    "",
    "Products:",
    productLines,
    "",
    `Total Amount: ${formatINR(totalAmount || 0)}`,
    "",
    "Delivery Address:",
    cleanText(deliveryAddress),
    "",
    `Payment Method: ${cleanText(paymentMethod, "Razorpay")}`,
    `Order Date: ${formatOrderDate(orderDate)}`,
    "",
    "Please confirm the order.",
  ].join("\n");
};

export const buildWhatsAppOrderUrl = (details: WhatsAppOrderDetails) =>
  `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(buildWhatsAppOrderMessage(details))}`;

export const openWhatsAppOrderUrl = (url: string) => {
  if (typeof window === "undefined" || !url) return false;

  try {
    const openedWindow = window.open(url, "_blank");
    if (openedWindow) {
      openedWindow.opener = null;
      return true;
    }
  } catch (_error) {
    return false;
  }

  return false;
};
