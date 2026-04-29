import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { BulkBrandUploadDialog } from "@/components/admin/BulkBrandUploadDialog";
import { BrandForm } from "@/components/admin/BrandForm";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotification } from "@/context/NotificationContext";
import type { Brand } from "@/data/brands";
import { brandsApi } from "@/services/api";

export const Route = createFileRoute("/admin/brands")({
  component: AdminBrands,
});

const formatCategory = (category: Brand["category"]) =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function AdminBrands() {
  const { addNotification } = useNotification();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | Brand["category"]>("all");
  const [sortMode, setSortMode] = useState<"name-asc" | "name-desc" | "products-desc">("name-asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const controlCls =
    "w-full rounded-lg border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";

  const loadBrands = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }

      try {
        const nextBrands = await brandsApi.list();
        setBrands(nextBrands);
        setError("");
      } catch (ex) {
        if (silent) {
          addNotification("Brand saved, but the list could not refresh.", "error");
        } else {
          setBrands([]);
          setError(ex instanceof Error ? ex.message : "Brands could not be loaded.");
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [addNotification],
  );

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const modalTitle = useMemo(
    () => (editingBrand ? `Edit ${editingBrand.name}` : "New Brand"),
    [editingBrand],
  );

  const categoryCounts = useMemo(() => {
    const counts = {
      all: brands.length,
      "middle-eastern": 0,
      designer: 0,
      niche: 0,
    };

    brands.forEach((brand) => {
      counts[brand.category] += 1;
    });

    return counts;
  }, [brands]);

  const visibleBrands = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? [...brands]
        : brands.filter((brand) => brand.category === categoryFilter);

    filtered.sort((left, right) => {
      if (sortMode === "name-desc") {
        return right.name.localeCompare(left.name);
      }

      if (sortMode === "products-desc") {
        const productDelta = (right.productCount ?? 0) - (left.productCount ?? 0);
        return productDelta !== 0 ? productDelta : left.name.localeCompare(right.name);
      }

      return left.name.localeCompare(right.name);
    });

    return filtered;
  }, [brands, categoryFilter, sortMode]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingBrand(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await brandsApi.remove(deleteTarget.id);
      setBrands((current) => current.filter((brand) => brand.id !== deleteTarget.id));
      setDeleteTarget(null);
      addNotification("Brand deleted successfully.");
      loadBrands(true);
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Brand could not be deleted.", "error");
    } finally {
      setDeleting(false);
    }
  }, [addNotification, deleteTarget, loadBrands]);

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Catalog</p>
          <h1 className="mt-1 font-display text-4xl text-navy">Brands</h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.25em] text-navy transition hover:bg-beige/40 sm:w-auto"
          >
            <Upload className="h-4 w-4" /> Bulk Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingBrand(null);
              setModalOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-5 py-3 text-xs uppercase tracking-[0.25em] text-beige transition hover:opacity-90 sm:w-auto"
          >
            <Plus className="h-4 w-4" /> New Brand
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">All Brands</p>
          <p className="mt-2 font-display text-4xl text-navy">{categoryCounts.all}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">Middle Eastern</p>
          <p className="mt-2 font-display text-4xl text-navy">{categoryCounts["middle-eastern"]}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">Designer</p>
          <p className="mt-2 font-display text-4xl text-navy">{categoryCounts.designer}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">Niche</p>
          <p className="mt-2 font-display text-4xl text-navy">{categoryCounts.niche}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-navy/55">
              Category Filter
            </span>
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value as "all" | Brand["category"])
              }
              className={`${controlCls} mt-2`}
            >
              <option value="all">All Categories</option>
              <option value="middle-eastern">Middle Eastern</option>
              <option value="designer">Designer</option>
              <option value="niche">Niche</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-navy/55">Sort Brands</span>
            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as "name-asc" | "name-desc" | "products-desc")
              }
              className={`${controlCls} mt-2`}
            >
              <option value="name-asc">Name A to Z</option>
              <option value="name-desc">Name Z to A</option>
              <option value="products-desc">Most Products</option>
            </select>
          </label>

          <div className="flex items-end">
            <div className="w-full rounded-xl border border-border bg-beige/30 px-4 py-3 text-sm text-navy/70 lg:w-auto">
              Showing <span className="font-medium text-navy">{visibleBrands.length}</span> brands
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-border/60 bg-card px-5 py-10 text-center text-sm text-navy/50 shadow-soft">
            Loading...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-border/60 bg-card px-5 py-10 text-center text-sm text-red-600 shadow-soft">
            {error}
          </div>
        ) : null}

        {!loading && !error && visibleBrands.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card px-5 py-10 text-center text-sm text-navy/50 shadow-soft">
            {brands.length === 0
              ? "No brands yet."
              : "No brands match the selected category filter."}
          </div>
        ) : null}

        {!loading &&
          !error &&
          visibleBrands.map((brand) => (
            <article
              key={brand.id}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-beige ring-1 ring-border">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-xl text-navy">
                      {brand.fallbackLetter || brand.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-medium text-navy">{brand.name}</h2>
                      <p className="mt-1 text-sm text-navy/60">{formatCategory(brand.category)}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-beige/30 px-3 py-2 text-right">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-navy/45">
                        Products
                      </p>
                      <p className="mt-1 text-base font-medium text-navy">
                        {brand.productCount ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBrand(brand);
                        setModalOpen(true);
                      }}
                      className="rounded-lg p-2 text-navy transition hover:bg-navy/10"
                      aria-label={`Edit ${brand.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(brand)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-100"
                      aria-label={`Delete ${brand.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[42rem] w-full text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70">
              <tr>
                <th className="px-4 py-4 text-left sm:px-6">Logo</th>
                <th className="px-4 py-4 text-left sm:px-6">Name</th>
                <th className="px-4 py-4 text-left sm:px-6">Category</th>
                <th className="px-4 py-4 text-right sm:px-6">Products</th>
                <th className="px-4 py-4 text-right sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-navy/50 sm:px-6">
                    Loading...
                  </td>
                </tr>
              ) : null}

              {!loading && error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-red-600 sm:px-6">
                    {error}
                  </td>
                </tr>
              ) : null}

              {!loading && !error && visibleBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-navy/50 sm:px-6">
                    {brands.length === 0
                      ? "No brands yet."
                      : "No brands match the selected category filter."}
                  </td>
                </tr>
              ) : null}

              {!loading &&
                !error &&
                visibleBrands.map((brand) => (
                  <tr key={brand.id} className="transition-colors hover:bg-beige/30">
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-beige ring-1 ring-border">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-lg text-navy">
                            {brand.fallbackLetter || brand.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-navy sm:px-6">{brand.name}</td>
                    <td className="px-4 py-4 text-navy/70 sm:px-6">
                      {formatCategory(brand.category)}
                    </td>
                    <td className="px-4 py-4 text-right text-navy/70 sm:px-6">
                      {brand.productCount ?? 0}
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBrand(brand);
                            setModalOpen(true);
                          }}
                          className="rounded-lg p-2 text-navy hover:bg-navy/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(brand)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setEditingBrand(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl text-navy">{modalTitle}</DialogTitle>
            <DialogDescription className="text-navy/60">
              Keep brand details minimal so the storefront cards stay clean and consistent.
            </DialogDescription>
          </DialogHeader>

          <BrandForm
            initial={editingBrand}
            submitLabel={editingBrand ? "Save Changes" : "Create Brand"}
            onSubmit={async (payload) => {
              if (editingBrand) {
                await brandsApi.updateWithLogo(editingBrand.id, payload);
                addNotification("Brand updated successfully.");
              } else {
                await brandsApi.createWithLogo(payload);
                addNotification("Brand created successfully.");
              }

              closeModal();
              loadBrands(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete brand"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.name}? Linked products will block this action.`
            : "Delete this brand?"
        }
        loading={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={confirmDelete}
      />
      <BulkBrandUploadDialog
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        existingBrands={brands}
        onImported={() => loadBrands(true)}
      />
    </AdminShell>
  );
}
