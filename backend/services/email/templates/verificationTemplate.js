import { baseTemplate, p } from "./baseTemplate.js";

export const verificationTemplate = ({ name, verificationUrl }) =>
  baseTemplate({
    title: "Verify your email",
    preheader: "Confirm your Purefumes Hyderabad email address.",
    body: [
      p(`Hello ${name},`),
      p("Please verify your email address so we can keep your account and order updates secure."),
    ].join(""),
    cta: { label: "Verify Email", href: verificationUrl },
  });
