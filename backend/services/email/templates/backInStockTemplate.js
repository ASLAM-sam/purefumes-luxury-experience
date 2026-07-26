import { baseTemplate, p } from "./baseTemplate.js";
import { formatINR } from "../../../utils/money.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const backInStockTemplate = ({ customerName = "there", product = {} }) => {
  const productName = product.name || "Your requested perfume";
  const image = String(product.image || "").trim();

  return baseTemplate({
    title: "Your perfume is back in stock",
    preheader: `${productName} is available again at Purefumes Hyderabad.`,
    cta: product.url
      ? {
          href: product.url,
          label: "Shop Now",
        }
      : undefined,
    body: [
      p(`Hello ${customerName},`),
      p("The perfume you requested is now back in stock."),
      image
        ? `<div style="margin:18px 0;overflow:hidden;border-radius:12px;border:1px solid #eadfc9;background:#f6f0e7;">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(productName)}" style="display:block;width:100%;max-height:320px;object-fit:cover;" />
          </div>`
        : "",
      `<div style="border:1px solid #eadfc9;border-radius:12px;padding:16px;background:#fffaf4;">
        <div style="font-size:18px;font-weight:700;color:#071f3f;">${escapeHtml(productName)}</div>
        ${
          Number(product.price || 0) > 0
            ? `<div style="margin-top:8px;font-size:15px;color:#c9a14a;font-weight:700;">${escapeHtml(formatINR(product.price))}</div>`
            : ""
        }
      </div>`,
      p("Thank you for shopping with Purefumes Hyderabad."),
    ].join(""),
  });
};
