import { createFileRoute } from "@tanstack/react-router";
import {
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useNotification } from "@/context/NotificationContext";
import type { Category } from "@/data/categories";
import { categoriesApi } from "@/services/api";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

const PAGE_SIZE = 8;
const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "featured", label: "Featured" },
  { id: "deleted", label: "Deleted" },
] as const;

const buildCategoryFormData = (category: Category, overrides: Partial<Category> = {}) => {
  const nextCategory = { ...category, ...overrides };
  const payload = new FormData();

  payload.append("name", nextCategory.name);
  payload.append("slug", nextCategory.slug || "");
  payload.append("image", nextCategory.image || "");
  payload.append("icon", nextCategory.icon || "");
  payload.append("color", nextCategory.color || "#8b5f3d");
  payload.append("description", nextCategory.description || "");
  payload.append("sortOrder", String(nextCategory.sortOrder || 0));
  payload.append("featured", String(Boolean(nextCategory.featured)));
  payload.append("isActive", String(Boolean(nextCategory.isActive)));

  return payload;
};

const arrayMove = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

function AdminCategoriesPage() {
  const { addNotification } = useNotification();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<(typeof STATUS_TABS)[number]["id"]>("all");
  const [page, setPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const loadCategories = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const nextCategories = await categoriesApi.listAdmin();
      setCategories(nextCategories.sort((left, right) => left.sortOrder - right.sortOrder));
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

  const filteredCategories = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesQuery =
        !normalizedQuery ||
        category.name.toLowerCase().includes(normalizedQuery) ||
        category.slug.toLowerCase().includes(normalizedQuery) ||
        category.description.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) {
        return false;
      }

      if (statusTab === "active") {
        return category.isActive && !category.isDeleted;
      }

      if (statusTab === "inactive") {
        return !category.isActive && !category.isDeleted;
      }

      if (statusTab === "featured") {
        return category.featured && !category.isDeleted;
      }

      if (statusTab === "deleted") {
        return category.isDeleted;
      }

      return true;
    });
  }, [categories, deferredQuery, statusTab]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCategories = filteredCategories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const summary = useMemo(
    () => ({
      total: categories.filter((category) => !category.isDeleted).length,
      active: categories.filter((category) => category.isActive && !category.isDeleted).length,
      featured: categories.filter((category) => category.featured && !category.isDeleted).length,
      hidden: categories.filter((category) => !category.isActive && !category.isDeleted).length,
    }),
    [categories],
  );

  const featuredQuickAccess = categories
    .filter((category) => category.featured && !category.isDeleted)
    .slice(0, 8);

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
          setEditingCategory(savedCategory);
        });
      } catch (ex) {
        addNotification(ex instanceof Error ? ex.message : "Category could not be saved.", "error");
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
      addNotification("Category moved to deleted state.");
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

  const handleQuickToggle = useCallback(
    async (category: Category, field: "isActive" | "featured") => {
      const optimistic = categories.map((item) =>
        item.id === category.id ? { ...item, [field]: !item[field], active: field === "isActive" ? !item.isActive : item.active } : item,
      );
      setCategories(optimistic);

      try {
        await categoriesApi.updateWithAssets(
          category.id,
          buildCategoryFormData(category, {
            [field]: !category[field],
            active: field === "isActive" ? !category.isActive : category.active,
            isActive: field === "isActive" ? !category.isActive : category.isActive,
          }),
        );
        addNotification(
          field === "featured"
            ? category.featured
              ? "Category removed from featured collections."
              : "Category added to featured collections."
            : category.isActive
              ? "Category hidden from storefront navigation."
              : "Category activated successfully.",
        );
        await loadCategories(true);
      } catch (ex) {
        setCategories(categories);
        addNotification(ex instanceof Error ? ex.message : "Category could not be updated.", "error");
      }
    },
    [addNotification, categories, loadCategories],
  );

  const persistCategoryOrder = useCallback(
    async (nextCategories: Category[]) => {
      const normalized = nextCategories.map((category, index) => ({
        ...category,
        sortOrder: index,
        displayOrder: index,
      }));

      setCategories(normalized);

      try {
        await categoriesApi.reorder(
          normalized
            .filter((category) => !category.isDeleted)
            .map((category, index) => ({
              id: category.id,
              sortOrder: index,
            })),
        );
        addNotification("Category order updated.");
        await loadCategories(true);
      } catch (ex) {
        addNotification(ex instanceof Error ? ex.message : "Category order could not be updated.", "error");
        await loadCategories(true);
      }
    },
    [addNotification, loadCategories],
  );

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const nextVisible = arrayMove(
      filteredCategories,
      filteredCategories.findIndex((category) => category.id === draggingId),
      filteredCategories.findIndex((category) => category.id === targetId),
    );
    const reorderedAll = [...categories].sort((left, right) => left.sortOrder - right.sortOrder);
    const visibleSet = new Set(filteredCategories.map((category) => category.id));
    let nextVisibleIndex = 0;
    const nextAll = reorderedAll.map((category) =>
      visibleSet.has(category.id) ? nextVisible[nextVisibleIndex++] : category,
    );

    setDraggingId(null);
    await persistCategoryOrder(nextAll);
  };

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

        <div className="flex flex-col gap-4 rounded-[var(--radius-panel)] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(243,237,226,0.9))] p-4 shadow-[0_18px_50px_rgba(7,31,63,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="fluid-eyebrow uppercase text-navy/45">Category Architecture</p>
              <h1 className="mt-2 font-display text-3xl text-navy md:text-5xl">
                Dynamic luxury category management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/62 md:text-base">
                Create, organize, feature, hide, and softly delete categories that flow into
                storefront navigation, product filters, homepage sections, and import automation.
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Live Categories", value: summary.total },
              { label: "Active", value: summary.active },
              { label: "Featured", value: summary.featured },
              { label: "Hidden", value: summary.hidden },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.35rem] border border-border/70 bg-white/75 p-4 shadow-[0_12px_28px_rgba(7,31,63,0.05)]"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-navy/45">{item.label}</p>
                <p className="mt-2 font-display text-3xl text-navy">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_24rem]">
        <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
          <div className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/42" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search categories"
                className="w-full rounded-xl border border-border bg-beige/30 py-3 pl-10 pr-4 text-sm text-navy outline-none transition focus:border-navy"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusTab(tab.id);
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                    statusTab === tab.id
                      ? "bg-navy text-beige"
                      : "border border-border bg-beige/25 text-navy/65 hover:border-navy/25 hover:text-navy"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-navy/45">
              <Sparkles className="h-4 w-4 text-gold" />
              Quick Access
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredQuickAccess.length ? (
                featuredQuickAccess.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setEditingCategory(category);
                      scrollEditorIntoView();
                    }}
                    className="rounded-full border border-border bg-beige/25 px-3 py-2 text-xs uppercase tracking-[0.16em] text-navy/70 transition hover:border-navy/25 hover:text-navy"
                  >
                    {category.name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-navy/55">Feature categories to pin them here.</p>
              )}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {error ? (
            <div className="rounded-[var(--radius-panel)] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="fluid-eyebrow uppercase text-navy/45">Directory</p>
                <h2 className="mt-1 font-display text-2xl text-navy">
                  {loading ? "Loading categories..." : `${filteredCategories.length} categories in view`}
                </h2>
              </div>
              <p className="text-sm text-navy/55">
                Drag cards to reorder. Changes save to the storefront navigation automatically.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-5 shadow-soft"
                >
                  <div className="h-6 w-40 animate-pulse rounded bg-beige/70" />
                  <div className="mt-3 h-4 w-64 animate-pulse rounded bg-beige/60" />
                  <div className="mt-5 h-20 animate-pulse rounded-[1.1rem] bg-beige/40" />
                </div>
              ))
            ) : pagedCategories.length ? (
              pagedCategories.map((category) => (
                <article
                  key={category.id}
                  draggable={!category.isDeleted}
                  onDragStart={() => setDraggingId(category.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(category.id)}
                  className={`rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft transition ${
                    draggingId === category.id ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <button
                        type="button"
                        className="mt-1 hidden rounded-xl border border-border bg-beige/25 p-2 text-navy/45 lg:inline-flex"
                        aria-label={`Reorder ${category.name}`}
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-white/80"
                            style={{ backgroundColor: category.color || "#8b5f3d" }}
                          />
                          <h3 className="font-display text-2xl text-navy">{category.name}</h3>
                          {category.featured ? (
                            <span className="rounded-full bg-gold/15 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold">
                              Featured
                            </span>
                          ) : null}
                          {category.isDeleted ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-red-700">
                              Deleted
                            </span>
                          ) : (
                            <span
                              className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
                                category.isActive
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {category.isActive ? "Active" : "Hidden"}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-navy/45">/{category.slug}</p>
                        <p className="mt-3 text-sm leading-7 text-navy/62">
                          {category.description || "No description added yet."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-navy/45">
                          <span>{category.productCount} linked products</span>
                          <span>Order {category.sortOrder + 1}</span>
                          {category.icon ? <span>Icon {category.icon}</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {!category.isDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleQuickToggle(category, "isActive")}
                            className="rounded-full border border-border bg-beige/25 px-3 py-2 text-xs uppercase tracking-[0.16em] text-navy transition hover:border-navy/25"
                          >
                            {category.isActive ? "Hide" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleQuickToggle(category, "featured")}
                            className="rounded-full border border-border bg-beige/25 px-3 py-2 text-xs uppercase tracking-[0.16em] text-navy transition hover:border-navy/25"
                          >
                            {category.featured ? "Unfeature" : "Feature"}
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(category);
                          scrollEditorIntoView();
                        }}
                        className="rounded-full border border-border bg-card p-3 text-navy transition hover:border-navy/25"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!category.isDeleted ? (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(category)}
                          className="rounded-full border border-red-200 bg-red-50 p-3 text-red-700 transition hover:bg-red-100"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[var(--radius-panel)] border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-navy/55">
                No categories match the current filters.
              </div>
            )}
          </div>

          {!loading && filteredCategories.length > PAGE_SIZE ? (
            <div className="flex flex-col gap-3 rounded-[var(--radius-panel)] border border-border/70 bg-card px-4 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-navy/55">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.16em] text-navy transition disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.16em] text-navy transition disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside ref={editorRef} className="xl:sticky xl:top-28 xl:h-fit">
          <div className="rounded-[var(--radius-panel)] border border-border/70 bg-card p-5 shadow-soft sm:p-6">
            <p className="fluid-eyebrow uppercase text-navy/45">
              {editingCategory?.id ? "Edit Category" : "Create Category"}
            </p>
            <h2 className="mt-2 font-display text-3xl text-navy">
              {editingCategory?.id ? editingCategory.name : "New luxury category"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-navy/58">
              Use color, icon, and featured state to control how this category surfaces in the
              storefront navigation and homepage collection blocks.
            </p>
            <div className="mt-6">
              <CategoryForm
                initial={editingCategory && editingCategory.id ? editingCategory : null}
                onSubmit={handleSave}
                submitLabel={saving ? "Saving..." : editingCategory?.id ? "Update Category" : "Create Category"}
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
            ? `Move ${deleteTarget.name} into deleted state? Products using only this category must be reassigned first.`
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
