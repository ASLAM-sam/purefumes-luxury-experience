import { r as reactExports, j as jsxRuntimeExports, aE as Quote } from "./vendor-react-98xxEzFV.js";
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
const testimonials = [
  {
    name: "Aarav M.",
    text: "Purefumes Hyderabad is my secret. The Khamrah decant convinced me to buy a full bottle.",
    location: "Hyderabad"
  },
  {
    name: "Zara K.",
    text: "Authenticity, packaging, fragrance, everything is impeccable. My go-to for rare scents.",
    location: "Mumbai"
  },
  {
    name: "Rohan S.",
    text: "Aventus from here smells exactly like the boutique. Genuine batch, fast delivery.",
    location: "Bangalore"
  },
  {
    name: "Ishita P.",
    text: "The 2ml decants let me try Xerjoff before committing. Brilliant concept, beautifully executed.",
    location: "Delhi"
  },
  {
    name: "Karan V.",
    text: "Customer service is luxury-grade. They guided me to the perfect signature scent.",
    location: "Pune"
  }
];
const Testimonials = reactExports.memo(function Testimonials2() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "py-14 md:py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { eyebrow: "Voices", title: "Customer Reviews" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 overflow-hidden md:mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        transition: { staggerChildren: 0.1 },
        className: "grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-5 md:gap-6 md:px-8 lg:flex lg:gap-8 lg:overflow-x-auto",
        children: testimonials.map((testimonial, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.figure,
          {
            initial: { opacity: 0, x: 30 },
            whileInView: { opacity: 1, x: 0 },
            viewport: { once: true },
            transition: { duration: 0.6, delay: index * 0.08 },
            className: "w-full max-w-full rounded-xl border border-border bg-card p-6 shadow-soft md:p-8 lg:w-[420px] lg:shrink-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Quote, { className: "h-6 w-6 text-gold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-[0.82rem] uppercase tracking-[0.3em] text-gold", children: "5 stars" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("blockquote", { className: "mt-5 font-display text-[1.35rem] italic leading-relaxed text-navy md:text-2xl", children: [
                '"',
                testimonial.text,
                '"'
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("figcaption", { className: "mt-6 border-t border-border pt-6 text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground md:text-[0.7rem] md:tracking-[0.32em]", children: [
                testimonial.name,
                " | ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gold", children: testimonial.location })
              ] })
            ]
          },
          testimonial.name
        ))
      }
    ) })
  ] });
});
export {
  Testimonials
};
