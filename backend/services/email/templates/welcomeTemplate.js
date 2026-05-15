import { baseTemplate, p } from "./baseTemplate.js";

export const welcomeTemplate = ({ name }) =>
  baseTemplate({
    title: "Welcome to Purefumes Hyderabad",
    preheader: "Your luxury fragrance account is ready.",
    body: [
      p(`Hello ${name},`),
      p("Your Purefumes Hyderabad account is ready. You can now save addresses, track previous orders, and enjoy a smoother checkout."),
    ].join(""),
  });
