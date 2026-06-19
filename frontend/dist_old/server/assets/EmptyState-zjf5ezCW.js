import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
const EmptyState = reactExports.memo(function EmptyState2({
  icon,
  title,
  description,
  action,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `rounded-[1.75rem] border border-dashed border-border/80 bg-white/70 px-6 py-10 text-center shadow-[0_18px_40px_rgba(7,31,63,0.08)] ${className}`,
      children: [
        icon ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold", children: icon }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-display text-2xl text-navy", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-md text-sm leading-7 text-navy/60", children: description }),
        action ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: action }) : null
      ]
    }
  );
});
export {
  EmptyState as E
};
