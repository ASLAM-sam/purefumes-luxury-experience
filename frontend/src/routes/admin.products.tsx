import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { FileSpreadsheet, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { BulkProductUploadDialog } from "@/components/admin/BulkProductUploadDialog";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useNotification } from "@/context/NotificationContext";
import type { Brand } from "@/data/brands";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/money";
import { brandsApi, categoriesApi, productsApi } from "@/services/api";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type CategoryFilter = "all" | string;
type ProductSortMode = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc";

const getProductPrice = (product: Product) => product.price ?? product.sizes[0]?.price ?? 0;

function AdminProducts() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { addNotification } = useNotification();
  const [list, setList] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [latestUpdatingId, setLatestUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortMode, setSortMode] = useState<ProductSortMode>("name-asc");
  const controlCls =
    "w-full rounded-lg border border-border bg-beige/35 px-4 py-3 text-sm text-navy outline-none transition focus:border-navy";

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }

      try {
        const products = await productsApi.list();
        setList(products);
        setError("");
      } catch (ex) {
        if (silent) {
          addNotification("Product saved, but the list could not refresh.", "error");
        } else {
          setList([]);
          setError(ex instanceof Error ? ex.message : "Products could not be loaded.");
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [addNotification],
  );

  const loadBrands = useCallback(
    async (silent = false) => {
      if (!silent) {
        setBrandsLoading(true);
      }

      try {
        const nextBrands = await brandsApi.list();
        setBrands(nextBrands);
      } catch (ex) {
        if (!silent) {
          addNotification(
            ex instanceof Error ? ex.message : "Brands could not be loaded for bulk import.",
            "error",
          );
        }
        setBrands([]);
      } finally {
        if (!silent) {
          setBrandsLoading(false);
        }
      }
    },
    [addNotification],
  );

  const loadCategories = useCallback(
    async (silent = false) => {
      if (!silent) {
        setCategoriesLoading(true);
      }

      try {
        const nextCategories = await categoriesApi.listAdmin();
        setCategories(nextCategories);
      } catch (ex) {
        if (!silent) {
          addNotification(
            ex instanceof Error ? ex.message : "Categories could not be loaded.",
            "error",
          );
        }
        setCategories([]);
      } finally {
        if (!silent) {
          setCategoriesLoading(false);
        }
      }
    },
    [addNotification],
  );

  useEffect(() => {
    if (pathname === "/admin/products") {
      load();
      loadBrands();
      loadCategories();
    }
  }, [load, loadBrands, loadCategories, pathname]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await productsApi.remove(deleteTarget.id);
      setList((current) => current.filter((product) => product.id !== deleteTarget.id));
      addNotification("Product deleted successfully.");
      setDeleteTarget(null);
      load(true);
    } catch (ex) {
      addNotification(ex instanceof Error ? ex.message : "Product could not be deleted.", "error");
    } finally {
      setDeleting(false);
    }
  }, [addNotification, deleteTarget, load]);

  const handleImported = useCallback(async () => {
    await Promise.all([load(true), loadBrands(true), loadCategories(true)]);
  }, [load, loadBrands, loadCategories]);

  const toggleLatest = useCallback(
    async (product: Product) => {
      const nextValue = !product.isLatest;
      setLatestUpdatingId(product.id);

      try {
        const updatedProduct = await productsApi.update(product.id, { isLatest: nextValue });
        setList((current) =>
          current.map((item) => (item.id === product.id ? { ...item, ...updatedProduct } : item)),
        );
        addNotification(nextValue ? "Product added to Latest Products." : "Product removed from Latest Products.");
      } catch (ex) {
        addNotification(ex instanceof Error ? ex.message : "Latest product status could not be updated.", "error");
      } finally {
        setLatestUpdatingId(null);
      }
    },
    [addNotification],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: list.length };

    list.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });

    return counts;
  }, [list]);

  const visibleProducts = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? [...list]
        : list.filter((product) => product.category === categoryFilter);

    filtered.sort((left, right) => {
      if (sortMode === "name-desc") {
        return right.name.localeCompare(left.name);
      }

      if (sortMode === "price-asc") {
        return getProductPrice(left) - getProductPrice(right);
      }

      if (sortMode === "price-desc") {
        return getProductPrice(right) - getProductPrice(left);
      }

      if (sortMode === "stock-asc") {
        const stockDelta = left.stock - right.stock;
        return stockDelta !== 0 ? stockDelta : left.name.localeCompare(right.name);
      }

      return left.name.localeCompare(right.name);
    });

    return filtered;
  }, [categoryFilter, list, sortMode]);

  if (pathname !== "/admin/products") {
    return <Outlet />;
  }

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="fluid-eyebrow uppercase text-navy/50">Catalog</p>
          <h1 className="mt-1 font-display text-[clamp(2rem,2vw+1.2rem,3rem)] text-navy">Products</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            disabled={brandsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.25em] text-navy transition hover:bg-beige/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {brandsLoading ? "Loading Brands..." : "Bulk Upload"}
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 bg-navy text-beige px-5 py-3 rounded-lg text-xs uppercase tracking-[0.25em] hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" /> New Product
          </Link>
        </div>
      </header>

      <section className="adaptive-admin-grid mt-8">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">All Products</p>
          <p className="mt-2 font-display text-4xl text-navy">{categoryCounts.all}</p>
        </div>
        {categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.18em] text-navy/50">{category.name}</p>
            <p className="mt-2 font-display text-4xl text-navy">{categoryCounts[category.name] || 0}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-[var(--radius-panel)] border border-border/70 bg-card p-4 shadow-soft sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-navy/55">
              Category Filter
            </span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              className={`${controlCls} mt-2`}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {!categoriesLoading && categories.length === 0 ? (
              <p className="mt-2 text-xs text-navy/55">No categories available yet.</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-navy/55">Sort Products</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as ProductSortMode)}
              className={`${controlCls} mt-2`}
            >
              <option value="name-asc">Name A to Z</option>
              <option value="name-desc">Name Z to A</option>
              <option value="price-asc">Price Low to High</option>
              <option value="price-desc">Price High to Low</option>
              <option value="stock-asc">Lowest Stock</option>
            </select>
          </label>

          <div className="flex items-end">
            <div className="w-full rounded-xl border border-border bg-beige/30 px-4 py-3 text-sm text-navy/70 lg:w-auto">
              Showing <span className="font-medium text-navy">{visibleProducts.length}</span>{" "}
              products
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 overflow-hidden rounded-[var(--radius-panel)] border border-border/60 bg-card shadow-soft">
        <div className="admin-table-shell">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 text-navy/70 text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Brand</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Latest</th>
                <th className="text-right px-6 py-4">Price</th>
                <th className="text-right px-6 py-4">Stock</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-navy/50">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-navy/50">
                    No products yet.
                  </td>
                </tr>
              )}

              {!loading && !error && list.length > 0 && visibleProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-navy/50">
                    No products match the selected category filter.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                visibleProducts.map((product) => {
                  const price = getProductPrice(product);

                  return (
                    <tr key={product.id} className="hover:bg-beige/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 rounded-lg object-contain object-center bg-beige p-1"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-lg bg-beige border border-border"
                            aria-hidden="true"
                          />
                        )}
                        <span className="font-medium text-navy">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-navy/70">
                        {product.brandDetails?.name || product.brand}
                      </td>
                      <td className="px-6 py-4 text-navy/70">{product.category}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => void toggleLatest(product)}
                          disabled={latestUpdatingId === product.id}
                          className={`rounded-full border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] transition disabled:opacity-50 ${
                            product.isLatest
                              ? "border-gold/40 bg-gold/15 text-gold"
                              : "border-border bg-beige/40 text-navy/55 hover:border-gold/40 hover:text-navy"
                          }`}
                          aria-pressed={Boolean(product.isLatest)}
                        >
                          {product.isLatest ? "Latest" : "Off"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right text-gold font-medium">
                        {formatINR(price)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right tabular-nums ${
                          product.stock <= 10 ? "text-amber-600" : "text-navy/70"
                        }`}
                      >
                        {product.stock}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to="/admin/products/$id"
                            params={{ id: product.id }}
                            className="p-2 rounded-lg hover:bg-navy/10 text-navy"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete product"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This action cannot be undone.`
            : "Delete this product?"
        }
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
      <BulkProductUploadDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        existingProducts={list}
        existingBrands={brands}
        onImported={handleImported}
      />
    </AdminShell>
  );
}
