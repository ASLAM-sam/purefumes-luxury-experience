import { baseTemplate, p } from "./baseTemplate.js";
import { formatINR } from "../../../utils/money.js";

const formatCurrency = formatINR;
const formatOrderNumber = (order = {}) =>
  order.publicOrderId ? `order #${order.publicOrderId}` : "your order";

export const orderTemplate = ({ name, order }) => {
  const items = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eadfc9;">${item.productName}</td>
        <td align="center" style="padding:10px 0;border-bottom:1px solid #eadfc9;">${item.quantity}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #eadfc9;">${formatCurrency(item.priceAtPurchase || item.price)}</td>
      </tr>`,
    )
    .join("");

  return baseTemplate({
    title: "Order confirmed",
    preheader: "Your fragrance order has been placed.",
    body: [
      p(`Hello ${name},`),
      p(`We have received ${formatOrderNumber(order)}. You will receive tracking updates as soon as it moves.`),
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;font-size:14px;">
        <tr><th align="left">Product</th><th align="center">Qty</th><th align="right">Price</th></tr>
        ${items}
        <tr><td colspan="2" style="padding-top:14px;font-weight:700;">Total</td><td align="right" style="padding-top:14px;font-weight:700;">${formatCurrency(order.totalAmount)}</td></tr>
      </table>`,
    ].join(""),
  });
};

export const orderStatusTemplate = ({ name, order }) =>
  baseTemplate({
    title: "Order status updated",
    preheader: `Your order is now ${order.status}.`,
    body: [
      p(`Hello ${name},`),
      p(`${formatOrderNumber(order)} is now ${order.status}.`),
      order.trackingId ? p(`Tracking ID: ${order.trackingId}`) : "",
    ].join(""),
  });
