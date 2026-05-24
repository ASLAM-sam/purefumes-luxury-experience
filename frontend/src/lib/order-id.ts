import type { Order } from "@/services/api";

const PUBLIC_ORDER_ID_PATTERN = /^\d{6}$/;

export const formatPublicOrderId = (value?: string | null) => {
  const normalized = String(value || "").trim().replace(/^#/, "");
  return PUBLIC_ORDER_ID_PATTERN.test(normalized) ? `#${normalized}` : "";
};

export const getOrderDisplayId = (order?: Pick<Order, "publicOrderId"> | null) =>
  formatPublicOrderId(order?.publicOrderId) || "Generating";
