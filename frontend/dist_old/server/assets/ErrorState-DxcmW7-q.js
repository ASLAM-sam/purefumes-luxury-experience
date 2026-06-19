import { r as reactExports, j as jsxRuntimeExports, _ as TriangleAlert, V as RefreshCw } from "./vendor-react-98xxEzFV.js";
import { B as Button } from "./router-DvCKRw9U.js";
const ErrorState = reactExports.memo(function ErrorState2({
  title = "Something needs attention",
  description,
  onRetry,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `rounded-[1.75rem] border border-red-200/70 bg-red-50/90 px-6 py-8 text-center shadow-[0_18px_40px_rgba(127,29,29,0.08)] ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/12 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-display text-2xl text-navy", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-lg text-sm leading-7 text-navy/70", children: description }),
        onRetry ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: onRetry, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
          "Retry"
        ] }) }) : null
      ]
    }
  );
});
export {
  ErrorState as E
};
