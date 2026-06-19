import { r as reactExports, j as jsxRuntimeExports, u as ShieldCheck, B as BadgeCheck, v as Headphones, T as Truck } from "./vendor-react-98xxEzFV.js";
import { C as Container } from "./router-DvCKRw9U.js";
import { S as SectionTitle } from "./SectionTitle-CUOodH3k.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
import "./vendor-tanstack-DkD25YnA.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-charts-Ot63D9Dz.js";
const highlights = [
  {
    title: "Secure Checkout",
    description: "Razorpay, UPI, cards, net banking and COD support through the official checkout.",
    Icon: ShieldCheck
  },
  {
    title: "Authentic Perfumes",
    description: "Products are sourced through trusted channels and checked before dispatch.",
    Icon: BadgeCheck
  },
  {
    title: "Customer Support",
    description: "Phone support is available Monday to Saturday from 11:00 AM to 6:00 PM.",
    Icon: Headphones
  },
  {
    title: "Fast Delivery Across India",
    description: "Orders are carefully packed, tracked after dispatch, and shipped across India.",
    Icon: Truck
  }
];
const AboutUs = reactExports.memo(function AboutUs2() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      id: "about-us",
      className: "bg-[#f7f3ed] py-[var(--section-space)]",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { eyebrow: "The Purefumes Promise", title: "Why Choose Us" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "adaptive-card-grid mx-auto mt-10 max-w-6xl md:mt-12", children: highlights.map(({ title, description, Icon }, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.article,
          {
            initial: { opacity: 0, y: 28 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-80px" },
            transition: { duration: 0.55, delay: index * 0.08 },
            className: "group rounded-[1.4rem] border border-border/70 bg-[#fffaf4] p-5 text-center shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:border-gold/45 sm:p-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dfb77c]/55 text-[#5b3a29] transition duration-300 ease-in-out group-hover:bg-[#c89b63] sm:h-14 sm:w-14", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 sm:h-6 sm:w-6" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 font-display text-[clamp(1.1rem,0.8vw+0.95rem,1.35rem)] text-[#5b3a29]", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-body-sm mt-2 text-[#8b6b56]", children: description })
            ]
          },
          title
        )) })
      ] })
    }
  );
});
export {
  AboutUs
};
