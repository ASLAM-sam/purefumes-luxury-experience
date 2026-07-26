import { baseTemplate, p } from "./baseTemplate.js";
import { formatINR } from "../../../utils/money.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(value))
    : "Not available";

const row = (label, value) => `
  <tr>
    <td style="padding:8px 0;color:#6c7890;">${escapeHtml(label)}</td>
    <td align="right" style="padding:8px 0;font-weight:700;color:#071f3f;">${escapeHtml(value || "-")}</td>
  </tr>`;

export const adminOrderNotificationTemplate = ({ order = {}, adminOrderUrl = "" }) => {
  const orderNumber = order.publicOrderId || order.id || order._id || "New order";
  const items = Array.isArray(order.items) ? order.items : [];
  const shippingAddress =
    order.address ||
    [
      order.shippingAddress?.line1 || order.shippingAddress?.street,
      order.shippingAddress?.line2 || order.shippingAddress?.landmark,
      order.shippingAddress?.city,
      order.shippingAddress?.state,
      order.shippingAddress?.postalCode || order.shippingAddress?.pincode,
      order.shippingAddress?.country,
    ]
      .filter(Boolean)
      .join(", ");

  return baseTemplate({
    title: "New order received",
    preheader: `Order ${orderNumber} has been placed.`,
    cta: adminOrderUrl
      ? {
          href: adminOrderUrl,
          label: "View Order",
        }
      : undefined,
    body: [
      p(`A new order has been placed: ${orderNumber}.`),
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;border-top:1px solid #eadfc9;border-bottom:1px solid #eadfc9;font-size:14px;">
        ${row("Order Number", orderNumber)}
        ${row("Date", formatDate(order.createdAt))}
        ${row("Customer Name", order.customerName)}
        ${row("Customer Email", order.email)}
        ${row("Customer Phone", order.mobileNumber || order.mobile || order.phone)}
        ${row("Shipping Address", shippingAddress)}
        ${row("Payment Method", order.paymentMethod || order.paymentGateway)}
        ${row("Payment Status", order.paymentStatus)}
        ${row("Razorpay Payment ID", order.paymentId)}
      </table>`,
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;font-size:14px;">
        <tr>
          <th align="left" style="padding-bottom:8px;border-bottom:1px solid #eadfc9;">Product</th>
          <th align="center" style="padding-bottom:8px;border-bottom:1px solid #eadfc9;">Qty</th>
          <th align="right" style="padding-bottom:8px;border-bottom:1px solid #eadfc9;">Price</th>
        </tr>
        ${items
          .map(
            (item) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eadfc9;">${escapeHtml(item.productName || order.productName || "Product")}</td>
                <td align="center" style="padding:10px 0;border-bottom:1px solid #eadfc9;">${escapeHtml(item.quantity || 1)}</td>
                <td align="right" style="padding:10px 0;border-bottom:1px solid #eadfc9;">${escapeHtml(formatINR(item.priceAtPurchase || item.price || 0))}</td>
              </tr>`,
          )
          .join("")}
      </table>`,
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;font-size:14px;">
        ${row("Subtotal", formatINR(order.subtotalAmount || order.totalAmount || 0))}
        ${row("Shipping", formatINR(order.shippingCharge || 0))}
        ${row("Discount", formatINR(order.discountAmount || 0))}
        ${row("Coupon", order.couponCode || "-")}
        ${row("Grand Total", formatINR(order.totalAmount || 0))}
        ${row("Special Instructions", order.specialInstructions || order.notes || "-")}
      </table>`,
    ].join(""),
  });
};
