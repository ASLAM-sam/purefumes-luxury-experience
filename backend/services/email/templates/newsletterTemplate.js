import { baseTemplate, p } from "./baseTemplate.js";

export const newsletterTemplate = ({ title = "Purefumes Edit", message = "" }) =>
  baseTemplate({
    title,
    preheader: "Luxury fragrance updates from Purefumes Hyderabad.",
    body: [p(message || "New arrivals, rare finds, and refined fragrance stories are waiting for you.")].join(""),
  });
