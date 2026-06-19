import { r as reactExports, j as jsxRuntimeExports, au as Upload, U as Plus, V as RefreshCw, aw as Pencil, J as Trash2 } from "./vendor-react-98xxEzFV.js";
import { A as AdminShell } from "./AdminShell-P9dOFq5Y.js";
import { B as Button, a as useNotification, d as categoriesApi } from "./router-DvCKRw9U.js";
import { C as ConfirmModal } from "./ConfirmModal-CZ9ASx2b.js";
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
const inputCls = "w-full rounded-xl border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";
const createFormState = (category) => ({
  name: category?.name || "",
  description: category?.description || "",
  image: category?.image || ""
});
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-navy/55", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children })
  ] });
}
const CategoryForm = reactExports.memo(function CategoryForm2({
  initial,
  onSubmit,
  submitLabel = "Save Category"
}) {
  const [form, setForm] = reactExports.useState(() => createFormState(initial));
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const imagePreview = reactExports.useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return form.image;
  }, [form.image, imageFile]);
  reactExports.useEffect(() => {
    setForm(createFormState(initial));
    setImageFile(null);
    setError("");
  }, [initial]);
  reactExports.useEffect(() => {
    return () => {
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!form.name.trim()) {
        throw new Error("Category name is required.");
      }
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("description", form.description.trim());
      payload.append("image", form.image.trim());
      if (imageFile) {
        payload.append("imageFile", imageFile);
      }
      await onSubmit(payload);
      if (!initial?.id) {
        setForm(createFormState(null));
        setImageFile(null);
      }
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Category could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        required: true,
        value: form.name,
        onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })),
        className: inputCls
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        rows: 5,
        value: form.description,
        onChange: (event) => setForm((current) => ({ ...current, description: event.target.value })),
        className: `${inputCls} resize-none`
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category Image Upload", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: imagePreview,
          alt: form.name || "Category preview",
          className: "aspect-[16/9] w-full rounded-xl object-cover object-center"
        }
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-navy/25 bg-beige/30 px-4 py-4 text-sm text-navy/70 transition hover:border-navy/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: imageFile ? imageFile.name : "Choose category image" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            accept: "image/jpeg,image/png,image/webp",
            onChange: (event) => setImageFile(event.target.files?.[0] || null),
            className: "sr-only"
          }
        )
      ] })
    ] }) }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end border-t border-border pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "!bg-navy !text-beige", children: saving ? "Saving..." : submitLabel }) })
  ] });
});
function AdminCategoriesPage() {
  const {
    addNotification
  } = useNotification();
  const editorRef = reactExports.useRef(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [editingCategory, setEditingCategory] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const loadCategories = reactExports.useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const nextCategories = await categoriesApi.listAdmin();
      setCategories(nextCategories);
    } catch (ex) {
      if (!silent) {
        setError(ex instanceof Error ? ex.message : "Categories could not be loaded.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);
  reactExports.useEffect(() => {
    void loadCategories();
  }, [loadCategories]);
  const scrollEditorIntoView = () => {
    editorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };
  const handleSave = reactExports.useCallback(async (payload) => {
    setSaving(true);
    try {
      const savedCategory = editingCategory?.id ? await categoriesApi.updateWithAssets(editingCategory.id, payload) : await categoriesApi.createWithAssets(payload);
      addNotification(editingCategory?.id ? "Category updated successfully." : "Category created successfully.");
      await loadCategories(true);
      reactExports.startTransition(() => {
        setEditingCategory(editingCategory?.id ? savedCategory : null);
      });
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Category could not be saved.", "error");
      throw ex;
    } finally {
      setSaving(false);
    }
  }, [addNotification, editingCategory?.id, loadCategories]);
  const handleDelete = reactExports.useCallback(async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await categoriesApi.remove(deleteTarget.id);
      addNotification("Category deleted successfully.");
      setDeleteTarget(null);
      if (editingCategory?.id === deleteTarget.id) {
        setEditingCategory(null);
      }
      await loadCategories(true);
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Category could not be deleted.", "error");
    } finally {
      setSaving(false);
    }
  }, [addNotification, deleteTarget, editingCategory?.id, loadCategories]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.32em] text-navy/45", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Catalog" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Categories" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[var(--radius-panel)] border border-white/70 bg-card p-4 shadow-soft sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/45", children: "Category Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-3xl text-navy md:text-5xl", children: "Simple Categories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-navy/62 md:text-base", children: "Add a category name, description, and image. Edit or delete it from the list." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
            setEditingCategory(null);
            scrollEditorIntoView();
          }, className: "inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-xs uppercase tracking-[0.2em] text-beige transition hover:opacity-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "New Category"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void loadCategories(), className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.2em] text-navy transition hover:border-navy/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
            "Refresh"
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
        error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[var(--radius-panel)] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700", children: error }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft sm:p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/45", children: "Category List" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 font-display text-2xl text-navy", children: loading ? "Loading categories..." : `${categories.length} categories` })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-2", children: loading ? Array.from({
          length: 4
        }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[16/9] animate-pulse rounded-xl bg-beige/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-6 w-40 animate-pulse rounded bg-beige/70" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-4 w-64 animate-pulse rounded bg-beige/60" })
        ] }, index)) : categories.length ? categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-card shadow-soft", children: [
          category.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: category.image, alt: category.name, className: "aspect-[16/9] w-full object-cover object-center" }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl text-navy", children: category.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 min-h-12 text-sm leading-7 text-navy/62", children: category.description || "No description added yet." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                setEditingCategory(category);
                scrollEditorIntoView();
              }, className: "inline-flex items-center gap-2 rounded-full border border-border bg-beige/25 px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-navy transition hover:border-navy/25", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
                "Edit"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setDeleteTarget(category), className: "inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                "Delete"
              ] })
            ] })
          ] })
        ] }, category.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[var(--radius-panel)] border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-navy/55 lg:col-span-2", children: "No categories yet. Create the first category from the form." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { ref: editorRef, className: "xl:sticky xl:top-28 xl:h-fit", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[var(--radius-panel)] border border-border/70 bg-card p-5 shadow-soft sm:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-navy/45", children: editingCategory?.id ? "Edit Category" : "Create Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl text-navy", children: editingCategory?.id ? editingCategory.name : "New Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryForm, { initial: editingCategory && editingCategory.id ? editingCategory : null, onSubmit: handleSave, submitLabel: editingCategory?.id ? "Update Category" : "Create Category" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { isOpen: Boolean(deleteTarget), title: "Delete category", message: deleteTarget ? `Delete ${deleteTarget.name}? This cannot be undone.` : "Delete this category?", loading: saving, onClose: () => {
      if (!saving) setDeleteTarget(null);
    }, onConfirm: () => void handleDelete() })
  ] });
}
export {
  AdminCategoriesPage as component
};
