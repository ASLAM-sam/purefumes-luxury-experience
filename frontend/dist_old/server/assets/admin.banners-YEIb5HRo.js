import { r as reactExports, j as jsxRuntimeExports, V as RefreshCw, aA as ImagePlus, aw as Pencil, a4 as ChevronLeft, a5 as ChevronRight, aB as Power, J as Trash2 } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { a as useNotification, _ as bannersApi } from "./router-DvCKRw9U.js";
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
  title: "",
  subtitle: "",
  image: "",
  buttonText: "",
  link: "",
  order: ""
};
const sortBanners = (items) => [...items].sort((left, right) => {
  const orderDelta = left.order - right.order;
  if (orderDelta !== 0) {
    return orderDelta;
  }
  return left.title.localeCompare(right.title);
});
function AdminBanners() {
  const {
    addNotification
  } = useNotification();
  const [banners, setBanners] = reactExports.useState([]);
  const [form, setForm] = reactExports.useState(initialForm);
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [editingBanner, setEditingBanner] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [pendingToggleId, setPendingToggleId] = reactExports.useState("");
  const [pendingDeleteId, setPendingDeleteId] = reactExports.useState("");
  const loadBanners = reactExports.useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const nextBanners = await bannersApi.listAdmin();
      setBanners(sortBanners(nextBanners));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Hero banners could not be loaded.";
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
    void loadBanners();
  }, [loadBanners]);
  const activeBannerCount = reactExports.useMemo(() => banners.filter((banner) => banner.isActive).length, [banners]);
  const previewImage = reactExports.useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return form.image.trim();
  }, [form.image, imageFile]);
  reactExports.useEffect(() => {
    if (!imageFile || !previewImage.startsWith("blob:")) {
      return;
    }
    return () => {
      URL.revokeObjectURL(previewImage);
    };
  }, [imageFile, previewImage]);
  const updateForm = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value
    }));
  };
  const resetForm = reactExports.useCallback(() => {
    setForm(initialForm);
    setImageFile(null);
    setEditingBanner(null);
    setError("");
  }, []);
  const beginEdit = (banner) => {
    setEditingBanner(banner);
    setImageFile(null);
    setError("");
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      link: banner.link,
      order: String(banner.order ?? 0)
    });
  };
  const submitBanner = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = new FormData();
    payload.set("title", form.title.trim());
    payload.set("subtitle", form.subtitle.trim());
    payload.set("buttonText", form.buttonText.trim());
    payload.set("link", form.link.trim());
    payload.set("order", form.order.trim() || "0");
    payload.set("isActive", editingBanner ? String(editingBanner.isActive) : "true");
    if (imageFile) {
      payload.set("imageFile", imageFile);
    } else if (form.image.trim()) {
      payload.set("image", form.image.trim());
    }
    try {
      const savedBanner = editingBanner ? await bannersApi.updateWithImage(editingBanner.id, payload) : await bannersApi.createWithImage(payload);
      setBanners((current) => {
        const next = editingBanner ? current.map((banner) => banner.id === editingBanner.id ? savedBanner : banner) : [savedBanner, ...current];
        return sortBanners(next);
      });
      addNotification(editingBanner ? "Hero banner updated successfully." : "Hero banner created successfully.");
      resetForm();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Hero banner could not be saved.";
      setError(message);
      addNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };
  const toggleBanner = async (banner) => {
    setPendingToggleId(banner.id);
    try {
      const updatedBanner = await bannersApi.toggle(banner.id);
      setBanners((current) => sortBanners(current.map((item) => item.id === banner.id ? updatedBanner : item)));
      addNotification(updatedBanner.isActive ? "Banner enabled successfully." : "Banner disabled successfully.");
    } catch (toggleError) {
      addNotification(toggleError instanceof Error ? toggleError.message : "Banner status could not be updated.", "error");
    } finally {
      setPendingToggleId("");
    }
  };
  const updateBannerOrder = async (banner, newOrder) => {
    setPendingToggleId(banner.id);
    try {
      const payload = new FormData();
      payload.set("order", String(newOrder));
      const updated = await bannersApi.updateWithImage(banner.id, payload);
      setBanners((current) => sortBanners(current.map((b) => b.id === banner.id ? updated : b)));
      addNotification("Banner order updated.");
    } catch (err) {
      addNotification(err instanceof Error ? err.message : "Banner order could not be updated.", "error");
    } finally {
      setPendingToggleId("");
    }
  };
  const deleteBanner = async (banner) => {
    setPendingDeleteId(banner.id);
    try {
      await bannersApi.remove(banner.id);
      setBanners((current) => current.filter((item) => item.id !== banner.id));
      if (editingBanner?.id === banner.id) {
        resetForm();
      }
      addNotification("Hero banner deleted successfully.");
    } catch (deleteError) {
      addNotification(deleteError instanceof Error ? deleteError.message : "Banner could not be deleted.", "error");
    } finally {
      setPendingDeleteId("");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.4em] text-navy/50", children: "Homepage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl text-navy", children: "Hero Banners" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-navy/60", children: [
          activeBannerCount,
          " active banner",
          activeBannerCount === 1 ? "" : "s",
          " rotating in the luxury homepage slider."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void loadBanners(true), disabled: refreshing, className: "inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-navy transition hover:bg-navy hover:text-beige disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-navy/55", children: editingBanner ? "Edit Banner" : "Create Banner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-navy/60", children: "Upload a fresh visual or paste an image URL, then control the display order." })
          ] }),
          editingBanner ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: resetForm, className: "rounded-lg border border-border px-3 py-2 text-[0.65rem] uppercase tracking-[0.22em] text-navy transition hover:bg-beige/50", children: "Cancel" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitBanner, className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Banner Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.title, onChange: updateForm("title"), placeholder: "Afnan Collection", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Subtitle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { required: true, value: form.subtitle, onChange: updateForm("subtitle"), placeholder: "Flat 50% Off on Premium Scents", rows: 3, className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Image URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.image, onChange: updateForm("image"), placeholder: "https://example.com/banner.jpg", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Upload Image" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-beige/20 px-4 py-3 text-sm text-navy/70 transition hover:border-gold hover:text-navy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: imageFile ? imageFile.name : "Choose banner image" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/jpeg,image/png,image/webp", onChange: (event) => setImageFile(event.target.files?.[0] || null), className: "sr-only" })
            ] })
          ] }),
          previewImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/70 bg-beige/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewImage, alt: form.title || "Banner preview", className: "h-40 w-full object-cover" }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Button Text" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.buttonText, onChange: updateForm("buttonText"), placeholder: "Shop Now", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Display Order" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "number", min: "0", value: form.order, onChange: updateForm("order"), placeholder: "1", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs uppercase tracking-[0.22em] text-navy/60", children: "Link" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.link, onChange: updateForm("link"), placeholder: "/shop", className: "w-full rounded-lg border border-border bg-beige/30 px-4 py-3 text-sm text-navy outline-none transition focus:border-gold" })
          ] }),
          error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: saving, className: "inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.24em] text-beige transition hover:opacity-90 disabled:opacity-50", children: saving ? editingBanner ? "Saving..." : "Creating..." : editingBanner ? "Save Banner" : "Create Banner" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[48rem] text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Banner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Link" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-center", children: "Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-6 py-10 text-center text-navy/50", children: "Loading hero banners..." }) }) : null,
          !loading && error ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-6 py-10 text-center text-red-600", children: error }) }) : null,
          !loading && !error && banners.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-6 py-10 text-center text-navy/50", children: "No hero banners created yet." }) }) : null,
          !loading && !error && banners.map((banner) => {
            const isToggling = pendingToggleId === banner.id;
            const isDeleting = pendingDeleteId === banner.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: banner.image, alt: banner.title, className: "h-20 w-28 rounded-2xl object-cover shadow-soft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-navy", children: banner.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-2 text-sm leading-6 text-navy/60", children: banner.subtitle }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[0.65rem] uppercase tracking-[0.24em] text-gold/90", children: banner.buttonText })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-navy/65", children: banner.link || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-center font-medium text-navy", children: banner.order }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] ${banner.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`, children: banner.isActive ? "Active" : "Disabled" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => beginEdit(banner), className: "rounded-lg p-2 text-navy transition hover:bg-navy/10", "aria-label": `Edit ${banner.title}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void updateBannerOrder(banner, Math.max(0, banner.order - 1)), className: "rounded-lg p-2 text-navy transition hover:bg-navy/10", "aria-label": `Move ${banner.title} up`, title: "Move up", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 transform rotate-90" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void updateBannerOrder(banner, banner.order + 1), className: "rounded-lg p-2 text-navy transition hover:bg-navy/10", "aria-label": `Move ${banner.title} down`, title: "Move down", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 transform -rotate-90" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void toggleBanner(banner), disabled: isToggling, className: "rounded-lg p-2 text-navy transition hover:bg-navy/10 disabled:opacity-50", "aria-label": `${banner.isActive ? "Disable" : "Enable"} ${banner.title}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void deleteBanner(banner), disabled: isDeleting, className: "rounded-lg p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50", "aria-label": `Delete ${banner.title}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
              ] }) })
            ] }, banner.id);
          })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  AdminBanners as component
};
