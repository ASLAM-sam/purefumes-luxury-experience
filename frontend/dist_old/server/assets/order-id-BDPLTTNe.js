const PUBLIC_ORDER_ID_PATTERN = /^\d{6}$/;
const formatPublicOrderId = (value) => {
  const normalized = String(value || "").trim().replace(/^#/, "");
  return PUBLIC_ORDER_ID_PATTERN.test(normalized) ? `#${normalized}` : "";
};
const getOrderDisplayId = (order) => formatPublicOrderId(order?.publicOrderId) || "Generating";
export {
  formatPublicOrderId as f,
  getOrderDisplayId as g
};
