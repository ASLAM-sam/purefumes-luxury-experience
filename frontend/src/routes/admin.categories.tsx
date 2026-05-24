import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useNotification } from "@/context/NotificationContext";
import type { Category } from "@/data/categories";
import { categoriesApi } from "@/services/api";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const { addNotification } = useNotification();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const loadCategories = useCallback(async (silent = false) => {
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

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const scrollEditorIntoView = () => {
    editorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSave = useCallback(
    async (payload: FormData) => {
      setSaving(true);

      try {
        const savedCategory = editingCategory?.id
          ? await categoriesApi.updateWithAssets(editingCategory.id, payload)
          : await categoriesApi.createWithAssets(payload);

        addNotification(
          editingCategory?.id ? "Category updated successfully." : "Category created successfully.",
        );

        await loadCategories(true);
        startTransition(() => {
          setEditingCategory(editingCategory?.id ? savedCategory : null);
        });
      } catch (ex) {
        addNotification(ex instanceof Error ? ex.message : "Category could not be saved.", "error");
        throw ex;
      } finally {
        setSaving(false);
      }
    },
    [addNotification, editingCategory?.id, loadCategories],
  );

  const handleDelete = useCallback(async () => {
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

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.32em] text-navy/45">
          <span>Admin</span>
          <span>/</span>
          <span>Catalog</span>
          <span>/</span>
          <span>Categories</span>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-white/70 bg-card p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="fluid-eyebrow uppercase text-navy/45">Category Management</p>
              <h1 className="mt-2 font-display text-3xl text-navy md:text-5xl">
                Simple Categories
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/62 md:text-base">
                Add a category name, description, and image. Edit or delete it from the list.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  scrollEditorIntoView();
                }}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-xs uppercase tracking-[0.2em] text-beige transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New Category
              </button>
              <button
                type="button"
                onClick={() => void loadCategories()}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.2em] text-navy transition hover:border-navy/30"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="space-y-4">
          {error ? (
            <div className="rounded-[var(--radius-panel)] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="fluid-eyebrow uppercase text-navy/45">Category List</p>
                <h2 className="mt-1 font-display text-2xl text-navy">
                  {loading ? "Loading categories..." : `${categories.length} categories`}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft"
                >
                  <div className="aspect-[16/9] animate-pulse rounded-xl bg-beige/50" />
                  <div className="mt-4 h-6 w-40 animate-pulse rounded bg-beige/70" />
                  <div className="mt-3 h-4 w-64 animate-pulse rounded bg-beige/60" />
                </div>
              ))
            ) : categories.length ? (
              categories.map((category) => (
                <article
                  key={category.id}
                  className="overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-card shadow-soft"
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="aspect-[16/9] w-full object-cover object-center"
                    />
                  ) : null}

                  <div className="p-4 sm:p-5">
                    <h3 className="font-display text-2xl text-navy">{category.name}</h3>
                    <p className="mt-3 min-h-12 text-sm leading-7 text-navy/62">
                      {category.description || "No description added yet."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(category);
                          scrollEditorIntoView();
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-beige/25 px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-navy transition hover:border-navy/25"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[var(--radius-panel)] border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-navy/55 lg:col-span-2">
                No categories yet. Create the first category from the form.
              </div>
            )}
          </div>
        </section>

        <aside ref={editorRef} className="xl:sticky xl:top-28 xl:h-fit">
          <div className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-5 shadow-soft sm:p-6">
            <p className="fluid-eyebrow uppercase text-navy/45">
              {editingCategory?.id ? "Edit Category" : "Create Category"}
            </p>
            <h2 className="mt-2 font-display text-3xl text-navy">
              {editingCategory?.id ? editingCategory.name : "New Category"}
            </h2>
            <div className="mt-6">
              <CategoryForm
                initial={editingCategory && editingCategory.id ? editingCategory : null}
                onSubmit={handleSave}
                submitLabel={editingCategory?.id ? "Update Category" : "Create Category"}
              />
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete category"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This cannot be undone.`
            : "Delete this category?"
        }
        loading={saving}
        onClose={() => {
          if (!saving) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </AdminShell>
  );
}
