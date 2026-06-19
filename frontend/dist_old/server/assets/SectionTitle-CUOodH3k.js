import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
const SectionTitle = reactExports.memo(function SectionTitle2({
  eyebrow,
  title,
  subtitle,
  center = true
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-80px" },
      transition: { duration: 0.7, ease: "easeOut" },
      className: center ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
      children: [
        eyebrow && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow mb-4 font-medium uppercase text-gold md:tracking-[0.42em]", children: eyebrow }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "fluid-section-title font-display text-foreground [overflow-wrap:anywhere]", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: `fluid-body mt-5 text-muted-foreground ${center ? "mx-auto max-w-2xl" : "max-w-xl"}`,
            children: subtitle
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-6 h-px w-24 gold-line ${center ? "mx-auto" : ""}` })
      ]
    }
  );
});
export {
  SectionTitle as S
};
