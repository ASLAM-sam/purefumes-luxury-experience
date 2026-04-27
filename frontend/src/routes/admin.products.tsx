import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { FileSpreadsheet, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { BulkProductUploadDialog } from "@/components/admin/BulkProductUploadDialog";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useNotification } from "@/context/NotificationContext";
import type { Brand } from "@/data/brands";
import type { Product } from "@/data/products";
import { brandsApi, productsApi } from "@/services/api";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const accordColors: Record<string, string> = {
  citrus: "bg-yellow-100 text-yellow-900 border-yellow-200",
  woody: "bg-amber-100 text-amber-950 border-amber-200",
  fresh: "bg-sky-100 text-sky-900 border-sky-200",
  floral: "bg-rose-100 text-rose-900 border-rose-200",
  sweet: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200",
  spicy: "bg-orange-100 text-orange-900 border-orange-200",
  amber: "bg-yellow-100 text-yellow-950 border-yellow-200",
  oud: "bg-stone-200 text-stone-950 border-stone-300",
  musky: "bg-zinc-100 text-zinc-800 border-zinc-200",
  vanilla: "bg-amber-50 text-amber-900 border-amber-200",
  aquatic: "bg-cyan-100 text-cyan-900 border-cyan-200",
  green: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

const accordClass = (name: string) =>
  accordColors[name.trim().toLowerCase()] || "bg-beige text-navy border-border";

type CategoryFilter = "all" | Product["category"];
type ProductSortMode = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc";

const productCategories: Product["category"][] = ["Middle Eastern", "Designer", "Niche"];

const getProductPrice = (product: Product) => product.price ?? product.sizes[0]?.price ?? 0;

function AdminProducts() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { addNotification } = useNotification();
  const [list, setList] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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

  useEffect(() => {
    if (pathname === "/admin/products") {
      load();
      loadBrands();
    }
  }, [load, loadBrands, pathname]);

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
    await Promise.all([load(true), loadBrands(true)]);
  }, [load, loadBrands]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: list.length,
      "Middle Eastern": 0,
      Designer: 0,
      Niche: 0,
    };

    list.forEach((product) => {
      counts[product.category] += 1;
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
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-navy/50">Catalog</p>
          <h1 className="font-display text-4xl text-navy mt-1">Products</h1>
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

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">All Products</p>
          <p className="mt-2 font-display text-4xl text-navy">{categoryCounts.all}</p>
        </div>
        {productCategories.map((category) => (
          <div key={category} className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.18em] text-navy/50">{category}</p>
            <p className="mt-2 font-display text-4xl text-navy">{categoryCounts[category]}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
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
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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

      <div className="mt-8 bg-card rounded-2xl shadow-soft border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 text-navy/70 text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Brand</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Accords</th>
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
                            className="w-12 h-12 rounded-lg object-cover bg-beige"
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
                        {product.accords?.length ? (
                          <div className="flex max-w-xs flex-wrap gap-1.5">
                            {product.accords.slice(0, 4).map((accord) => (
                              <span
                                key={accord.name}
                                className={`rounded-full border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.14em] ${accordClass(accord.name)}`}
                              >
                                {accord.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-navy/40">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gold font-medium">
                        Rs. {price.toLocaleString("en-IN")}
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
