import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { a as useNotification, w as paymentsApi, B as Button } from "./router-DvCKRw9U.js";
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
import "./vendor-motion-3kNaalGV.js";
import "./vendor-charts-Ot63D9Dz.js";
function AdminSettingsPage() {
  const {
    addNotification
  } = useNotification();
  const [settings, setSettings] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    let active = true;
    void paymentsApi.getSettings().then((nextSettings) => {
      if (!active) return;
      setSettings(nextSettings);
      setError("");
    }).catch((ex) => {
      if (!active) return;
      setError(ex instanceof Error ? ex.message : "Settings could not be loaded.");
    }).finally(() => {
      if (active) {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const updatePaymentMode = async (paymentMode2) => {
    setSaving(true);
    setError("");
    try {
      const nextSettings = await paymentsApi.updateSettings(paymentMode2);
      setSettings(nextSettings);
      addNotification(`Payment mode switched to ${paymentMode2 === "test" ? "Test" : "Live"} mode.`);
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : "Payment mode could not be updated.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };
  const paymentMode = settings?.paymentMode || "live";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-[var(--radius-panel)] border border-border/70 bg-card p-5 shadow-soft sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/50", children: "Operations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-[clamp(2rem,2vw+1.2rem,3rem)] text-navy", children: "Settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-navy/60", children: "Control live versus sandbox payment behavior without touching checkout routes or order persistence." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.4rem] border border-border/70 bg-[#faf7f1] p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-navy/50", children: "Payment Mode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl text-navy", children: loading ? "Loading..." : paymentMode === "test" ? "Test Mode" : "Live Mode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-7 text-navy/60", children: "Test mode keeps order creation, admin visibility, inventory updates, and analytics intact while skipping real gateway charges. Live mode restores normal Razorpay flow." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: paymentMode === "live" ? "gold" : "soft", disabled: saving || loading, onClick: () => void updatePaymentMode("live"), children: "Live Mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: paymentMode === "test" ? "gold" : "soft", disabled: saving || loading, onClick: () => void updatePaymentMode("test"), children: "Test Mode" })
        ] }),
        error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-red-600", children: error }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.4rem] border border-border/70 bg-[#f5efe3] p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-navy/50", children: "Current Behavior" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-3 text-sm leading-7 text-navy/62", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Live mode charges through Razorpay when credentials are configured." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Test mode keeps the order pipeline active without hitting the real gateway." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Admin analytics and order lists continue reflecting simulated test checkouts." })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  AdminSettingsPage as component
};
