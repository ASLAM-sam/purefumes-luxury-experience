import { r as reactExports, j as jsxRuntimeExports, V as RefreshCw, S as Search, X, aw as Pencil, J as Trash2 } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { a as useNotification, o as couponsApi, p as productsApi, f as formatINR } from "./router-DvCKRw9U.js";
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
const initialForm = {
  code: "",
  discountType: "fixed",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
  applicabilityType: "all",
  applicableProducts: []
};
const formatCurrency = formatINR;
const formatDiscount = (coupon) => {
  if (coupon.discountType === "fixed") {
    return formatCurrency(coupon.discountValue);
  }
  const maxDiscountLabel = coupon.maxDiscount ? ` up to ${formatCurrency(coupon.maxDiscount)}` : "";
  return `${coupon.discountValue}%${maxDiscountLabel}`;
};
const isCouponExpired = (coupon) => Boolean(coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now());
const formatExpiry = (coupon) => {
  if (!coupon.expiryDate) {
    return "No expiry";
  }
  return new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
const toSelectedPerfume = (product) => ({
  id: String(product.id || product._id || ""),
  name: product.name || "Untitled perfume",
  brand: product.brand || "",
  image: product.image || product.images?.[0] || "",
  price: product.price
});
const getCouponForm = (coupon) => ({
  code: coupon.code,
  discountType: coupon.discountType,
  discountValue: String(coupon.discountValue || ""),
  minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
  maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
  expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
  applicabilityType: coupon.applicabilityType || "all",
  applicableProducts: (coupon.applicableProducts || []).map(toSelectedPerfume).filter((product) => product.id)
});
function AdminCoupons() {
  const {
    addNotification
  } = useNotification();
  const [coupons, setCoupons] = reactExports.useState([]);
  const [form, setForm] = reactExports.useState(initialForm);
  const [loading, setLoading] = reactExports.useState(true);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [pendingToggleId, setPendingToggleId] = reactExports.useState("");
  const [pendingDeleteId, setPendingDeleteId] = reactExports.useState("");
  const [editingCouponId, setEditingCouponId] = reactExports.useState("");
  const [productSearch, setProductSearch] = reactExports.useState("");
  const [productResults, setProductResults] = reactExports.useState([]);
  const [productSearchLoading, setProductSearchLoading] = reactExports.useState(false);
  const loadCoupons = reactExports.useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const nextCoupons = await couponsApi.list();
      setCoupons(nextCoupons);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Coupons could not be loaded.";
      setError(message);
      if (silent) {
        addNotification(message, "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addNotification]);
  reactExports.useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);
  reactExports.useEffect(() => {
    if (form.applicabilityType !== "selected") {
      setProductResults([]);
      setProductSearchLoading(false);
      return;
    }
    let active = true;
    const timeoutId = window.setTimeout(() => {
      setProductSearchLoading(true);
      void productsApi.list({
        search: productSearch.trim() || void 0,
        limit: 8
      }, {
        forceFresh: true
      }).then((products) => {
        if (!active) return;
        setProductResults(products);
      }).catch(() => {
        if (!active) return;
        setProductResults([]);
      }).finally(() => {
        if (active) setProductSearchLoading(false);
      });
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [form.applicabilityType, productSearch]);
  const activeCoupons = reactExports.useMemo(() => coupons.filter((coupon) => coupon.isActive && !isCouponExpired(coupon)).length, [coupons]);
  const updateForm = (key) => (event) => {
    const value = key === "code" ? event.target.value.toUpperCase().replace(/\s+/g, "") : event.target.value;
    setForm((current) => ({
      ...current,
      [key]: value,
      ...key === "discountType" && value === "fixed" ? {
        maxDiscount: ""
      } : {},
      ...key === "applicabilityType" && value === "all" ? {
        applicableProducts: []
      } : {}
    }));
  };
  const selectPerfume = (product) => {
    const nextProduct = toSelectedPerfume(product);
    if (!nextProduct.id) return;
    setForm((current) => {
      if (current.applicableProducts.some((item) => item.id === nextProduct.id)) {
        return current;
      }
      return {
        ...current,
        applicableProducts: [...current.applicableProducts, nextProduct]
      };
    });
    setProductSearch("");
  };
  const removePerfume = (productId) => {
    setForm((current) => ({
      ...current,
      applicableProducts: current.applicableProducts.filter((product) => product.id !== productId)
    }));
  };
  const resetForm = () => {
    setForm(initialForm);
    setEditingCouponId("");
    setProductSearch("");
    setProductResults([]);
  };
  const editCoupon = (coupon) => {
    setForm(getCouponForm(coupon));
    setEditingCouponId(coupon.id || coupon._id || "");
    setProductSearch("");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const saveCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (form.applicabilityType === "selected" && form.applicableProducts.length === 0) {
        throw new Error("Select at least one fragrance for this coupon.");
      }
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscount: form.discountType === "percentage" && form.maxDiscount ? Number(form.maxDiscount) : null,
        expiryDate: form.expiryDate ? (/* @__PURE__ */ new Date(`${form.expiryDate}T23:59:59`)).toISOString() : null,
        isActive: editingCouponId ? coupons.find((coupon) => (coupon.id || coupon._id) === editingCouponId)?.isActive ?? true : true,
        applicabilityType: form.applicabilityType,
        applicableProducts: form.applicabilityType === "selected" ? form.applicableProducts.map((product) => product.id) : []
      };
      if (editingCouponId) {
        const updatedCoupon = await couponsApi.update(editingCouponId, payload);
        setCoupons((current) => current.map((coupon) => (coupon.id || coupon._id) === editingCouponId ? updatedCoupon : coupon));
        addNotification("Coupon updated successfully.");
      } else {
        const createdCoupon = await couponsApi.create(payload);
        setCoupons((current) => [createdCoupon, ...current]);
        addNotification("Coupon created successfully.");
      }
      resetForm();
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Coupon could not be created.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };
  const toggleCoupon = async (coupon) => {
    const couponId = coupon.id || coupon._id;
    if (!couponId) return;
    setPendingToggleId(couponId);
    try {
      const updatedCoupon = await couponsApi.toggle(couponId);
      setCoupons((current) => current.map((item) => (item.id || item._id) === couponId ? updatedCoupon : item));
      addNotification(updatedCoupon.isActive ? "Coupon enabled successfully." : "Coupon disabled successfully.");
    } catch (toggleError) {
      addNotification(toggleError instanceof Error ? toggleError.message : "Coupon status could not be updated.", "error");
    } finally {
      setPendingToggleId("");
    }
  };
  const deleteCoupon = async (coupon) => {
    const couponId = coupon.id || coupon._id;
    if (!couponId) return;
    setPendingDeleteId(couponId);
    try {
      await couponsApi.remove(couponId);
      setCoupons((current) => current.filter((item) => (item.id || item._id) !== couponId));
      addNotification("Coupon deleted successfully.");
    } catch (deleteError) {
      addNotification(deleteError instanceof Error ? deleteError.message : "Coupon could not be deleted.", "error");
    } finally {
      setPendingDeleteId("");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] tracking-[0.4em] uppercase text-navy/50", children: "Discounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl text-navy", children: "Coupons" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-navy/60", children: [
          activeCoupons,
          " active coupon",
          activeCoupons === 1 ? "" : "s",
          " ready for checkout."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void loadCoupons(true), disabled: refreshing, className: "inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-navy transition hover:bg-navy hover:text-beige disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-navy/55", children: editingCouponId ? "Edit Coupon" : "Create Coupon" }),
            editingCouponId ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-navy/50", children: "Update values without changing the coupon code history." }) : null
          ] }),
          editingCouponId ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: resetForm, className: "rounded-full border border-border bg-beige/40 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-navy/65 transition hover:border-gold/60 hover:text-gold", children: "Cancel" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveCoupon, className: "mt-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Coupon Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.code, onChange: updateForm("code"), placeholder: "SAVE10", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm uppercase text-navy outline-none transition focus:border-gold" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Discount Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.discountType, onChange: updateForm("discountType"), className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fixed", children: "Fixed Rupees" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "percentage", children: "Percentage" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: form.discountType === "fixed" ? "Discount Amount (₹)" : "Discount Percent (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "number", min: "0", step: "0.01", value: form.discountValue, onChange: updateForm("discountValue"), placeholder: form.discountType === "percentage" ? "10" : "100", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Minimum Order Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", step: "0.01", value: form.minOrderAmount, onChange: updateForm("minOrderAmount"), placeholder: "0", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
          ] }),
          form.discountType === "percentage" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Max Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", step: "0.01", value: form.maxDiscount, onChange: updateForm("maxDiscount"), placeholder: "Optional", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: form.expiryDate, onChange: updateForm("expiryDate"), className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/70 bg-beige/20 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.22em] text-navy/60", children: "Coupon Applicability" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: [{
              value: "all",
              label: "All Perfumes"
            }, {
              value: "selected",
              label: "Selected Perfumes Only"
            }].map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${form.applicabilityType === option.value ? "border-gold/70 bg-white text-navy shadow-soft" : "border-border bg-white/55 text-navy/68 hover:border-gold/45"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "applicabilityType", value: option.value, checked: form.applicabilityType === option.value, onChange: updateForm("applicabilityType"), className: "h-4 w-4 accent-[#8b5f3d]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: option.label })
            ] }, option.value)) }),
            form.applicabilityType === "selected" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative block", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "search", value: productSearch, onChange: (event) => setProductSearch(event.target.value), placeholder: "Search perfumes by name", className: "w-full rounded-lg border border-border bg-white px-10 py-3 text-sm text-navy outline-none transition focus:border-gold" }),
                productSearch ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setProductSearch(""), className: "absolute right-3 top-1/2 -translate-y-1/2 text-navy/45 transition hover:text-navy", "aria-label": "Clear perfume search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-white/70 p-2", children: productSearchLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2 text-sm text-navy/50", children: "Searching perfumes..." }) : productResults.length ? productResults.filter((product) => !form.applicableProducts.some((selected) => selected.id === (product.id || product._id))).slice(0, 6).map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => selectPerfume(product), className: "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-navy transition hover:bg-beige/60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate font-medium", children: product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block truncate text-xs text-navy/50", children: product.brand || "Purefumes" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs uppercase tracking-[0.16em] text-gold", children: "Select" })
              ] }, product.id || product._id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2 text-sm text-navy/50", children: productSearch.trim() ? "No perfumes found." : "Start typing to search perfumes." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.22em] text-navy/50", children: "Selected Perfumes" }),
                form.applicableProducts.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: form.applicableProducts.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex max-w-full items-center gap-2 rounded-full border border-gold/30 bg-white px-3 py-2 text-xs text-navy shadow-soft", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "max-w-[12rem] truncate", children: [
                    product.name,
                    product.brand ? ` - ${product.brand}` : ""
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removePerfume(product.id), className: "text-navy/45 transition hover:text-red-600", "aria-label": `Remove ${product.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
                ] }, product.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-dashed border-border bg-white/55 px-3 py-3 text-sm text-navy/50", children: "No perfumes selected yet." })
              ] })
            ] }) : null
          ] }),
          error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: saving, className: "inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.24em] text-beige transition hover:opacity-90 disabled:opacity-50", children: saving ? editingCouponId ? "Saving..." : "Creating..." : editingCouponId ? "Save Coupon" : "Create Coupon" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Discount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Applicability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-navy/50", children: "Loading coupons..." }) }) : null,
          !loading && error ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-red-600", children: error }) }) : null,
          !loading && !error && coupons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-navy/50", children: "No coupons created yet." }) }) : null,
          !loading && !error && coupons.map((coupon) => {
            const couponId = coupon.id || coupon._id;
            const expired = isCouponExpired(coupon);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top transition-colors hover:bg-beige/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: coupon.code }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-navy/50", children: [
                  "Min order ",
                  formatCurrency(coupon.minOrderAmount)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/75", children: formatDiscount(coupon) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: coupon.applicabilityType === "selected" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[14rem]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-[0.18em] text-gold", children: "Selected only" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-xs text-navy/55", children: coupon.applicableProducts.map((product) => product.name).filter(Boolean).join(", ") || `${coupon.applicableProductIds.length} perfumes` })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-navy/50", children: "All Perfumes" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${expired ? "bg-red-100 text-red-700" : coupon.isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`, children: expired ? "Expired" : coupon.isActive ? "Active" : "Inactive" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/70", children: formatExpiry(coupon) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => editCoupon(coupon), className: "inline-flex items-center gap-2 rounded-lg border border-border bg-beige/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-navy transition hover:bg-beige/60 disabled:opacity-50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                  "Edit"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void toggleCoupon(coupon), disabled: pendingToggleId === couponId, className: "rounded-lg border border-border bg-beige/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-navy transition hover:bg-beige/60 disabled:opacity-50", children: pendingToggleId === couponId ? "Saving..." : coupon.isActive ? "Disable" : "Enable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void deleteCoupon(coupon), disabled: pendingDeleteId === couponId, className: "inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-100 disabled:opacity-50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  pendingDeleteId === couponId ? "Deleting..." : "Delete"
                ] })
              ] }) })
            ] }, couponId);
          })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  AdminCoupons as component
};
