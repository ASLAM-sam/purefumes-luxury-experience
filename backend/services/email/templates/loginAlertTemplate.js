import { baseTemplate, p } from "./baseTemplate.js";

export const loginAlertTemplate = ({ name, ip, userAgent }) =>
  baseTemplate({
    title: "New login to your account",
    preheader: "We noticed a new login.",
    body: [
      p(`Hello ${name},`),
      p(`A new login was recorded for your Purefumes Hyderabad account from ${ip || "an unknown IP"}.`),
      p(`Device: ${userAgent || "Unknown device"}`),
    ].join(""),
  });
