import { j as jsxRuntimeExports, _ as TriangleAlert, X } from "./vendor-react-98xxEzFV.js";
import { B as Button } from "./router-DvCKRw9U.js";
function ConfirmModal({
  isOpen,
  title = "Confirm action",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[120] flex items-center justify-center bg-navy/65 px-4 py-8 backdrop-blur-sm",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "confirm-modal-title",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-lg border border-border bg-card p-6 text-navy shadow-luxe", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "confirm-modal-title", className: "font-display text-2xl text-navy", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-navy/65", children: message })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onClose,
              disabled: loading,
              className: "rounded-full p-2 text-navy/45 transition hover:bg-beige hover:text-navy disabled:opacity-50",
              "aria-label": "Close confirmation modal",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: cancelLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              onClick: onConfirm,
              disabled: loading,
              className: "!bg-red-600 !text-white hover:!opacity-90",
              children: loading ? `${confirmLabel}...` : confirmLabel
            }
          )
        ] })
      ] })
    }
  );
}
export {
  ConfirmModal as C
};
