import { j as jsxRuntimeExports, ap as CalendarDays } from "./vendor-react-98xxEzFV.js";
import { D as DATE_RANGE_OPTIONS, g as getDateRangeLabel } from "./useDateRangeFilter-BRGCZQlN.js";
function DateRangeFilter({
  range,
  from,
  to,
  maxDate,
  error = "",
  disabled = false,
  onRangeChange,
  onFromChange,
  onToChange,
  action,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: `rounded-[1.35rem] border border-white/70 bg-white/78 p-3 shadow-[0_14px_30px_rgba(7,31,63,0.07)] backdrop-blur sm:p-4 ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/45", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4 text-gold" }),
          "Date range"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: DATE_RANGE_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => onRangeChange(option.key),
            className: `min-h-10 rounded-full px-3.5 text-[0.68rem] uppercase tracking-[0.18em] transition sm:px-4 ${range === option.key ? "bg-navy text-beige shadow-[0_12px_24px_rgba(7,31,63,0.18)]" : "bg-navy/6 text-navy/62 hover:bg-navy/10"} disabled:cursor-not-allowed disabled:opacity-55`,
            children: option.label
          },
          option.key
        )) }),
        range === "custom" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] uppercase tracking-[0.22em] text-navy/45", children: "Start date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: from,
                max: to || maxDate,
                disabled,
                onChange: (event) => onFromChange(event.target.value),
                className: "h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70 disabled:opacity-60"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.65rem] uppercase tracking-[0.22em] text-navy/45", children: "End date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: to,
                min: from || void 0,
                max: maxDate,
                disabled,
                onChange: (event) => onToChange(event.target.value),
                className: "h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70 disabled:opacity-60"
              }
            )
          ] })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col gap-3 text-sm text-navy/58 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: error || getDateRangeLabel(range, from, to) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto", children: action })
        ] })
      ]
    }
  );
}
export {
  DateRangeFilter as D
};
