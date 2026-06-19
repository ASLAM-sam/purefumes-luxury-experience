import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { L as LoadingSkeleton } from "./LoadingSkeleton-ByWjt3UG.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
const toneClasses = {
  navy: "from-[#071f3f] to-[#0f2f58] text-white",
  gold: "from-[#c9a14a] to-[#e5c978] text-navy",
  emerald: "from-[#21664c] to-[#35a56f] text-white",
  rose: "from-[#7f1d1d] to-[#dc2626] text-white"
};
const StatCard = reactExports.memo(function StatCard2({
  label,
  value,
  icon,
  tone = "navy",
  meta,
  loading = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      layout: true,
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35 },
      className: `overflow-hidden rounded-[var(--radius-panel)] bg-gradient-to-br p-[1px] shadow-[0_18px_48px_rgba(7,31,63,0.12)] ${toneClasses[tone]}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full rounded-[calc(var(--radius-panel)-1px)] bg-white/88 p-4 text-navy backdrop-blur sm:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/55", children: label }),
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "mt-4 h-9 w-28" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-display text-[clamp(1.8rem,2vw+1.2rem,3rem)] leading-none text-navy", children: value })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClasses[tone]} shadow-[0_18px_30px_rgba(7,31,63,0.12)] sm:h-12 sm:w-12`,
              children: icon
            }
          )
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, { className: "mt-4 h-4 w-36" }) : meta ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fluid-body-sm mt-4 text-navy/60", children: meta }) : null
      ] })
    }
  );
});
export {
  StatCard as S
};
