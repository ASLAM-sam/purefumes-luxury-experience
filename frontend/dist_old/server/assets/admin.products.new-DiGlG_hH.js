import { j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { f as useNavigate } from "./vendor-tanstack-DkD25YnA.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { P as ProductForm } from "./ProductForm-B4G5ADCS.js";
import { a as useNotification, p as productsApi } from "./router-DvCKRw9U.js";
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
import "./vendor-motion-3kNaalGV.js";
import "./vendor-charts-Ot63D9Dz.js";
function NewProduct() {
  const nav = useNavigate();
  const {
    addNotification
  } = useNotification();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] tracking-[0.4em] uppercase text-navy/50", children: "Catalog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl text-navy mt-1", children: "New Product" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 max-w-4xl bg-card rounded-2xl p-8 shadow-soft border border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductForm, { resetOnSuccess: true, submitLabel: "Create Product", onSubmit: async (payload, options) => {
      await productsApi.createWithImages(payload, options);
      addNotification("Product added to MongoDB.");
      nav({
        to: "/admin/products"
      });
    } }) })
  ] });
}
export {
  NewProduct as component
};
