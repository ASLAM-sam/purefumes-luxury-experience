export type PaymentStatusValue =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "success"
  | "completed";
export type OrderStatusValue =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export const normalizePaymentStatus = (status?: string | null): PaymentStatusValue => {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  if (normalized === "paid") return "paid";
  if (normalized === "success") return "paid";
  if (normalized === "completed") return "paid";
  if (normalized === "failed") return "failed";
  if (normalized === "refunded") return "refunded";
  return "pending";
};

export const normalizeDisplayOrderStatus = (
  paymentStatus?: string | null,
  status?: string | null,
  orderStatus?: string | null,
): OrderStatusValue => {
  const rawStatus = String(status || orderStatus || "Pending").trim() as OrderStatusValue;
  return normalizePaymentStatus(paymentStatus) === "paid" && rawStatus === "Pending"
    ? "Confirmed"
    : rawStatus;
};

export const formatPaymentStatusLabel = (status?: string | null) => {
  switch (normalizePaymentStatus(status)) {
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return "Pending";
  }
};

export const formatOrderStatusLabel = (status?: string | null) => {
  const normalized = String(status || "Pending").trim();
  return normalized || "Pending";
};
