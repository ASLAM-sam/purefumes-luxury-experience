import { createFileRoute } from "@tanstack/react-router";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import { CategoryRail } from "@/components/category/CategoryRail";
import { ProductCard } from "@/components/product/ProductCard";
import { SiteShell } from "@/components/layout/SiteShell";
import { Skeleton } from "@/components/ui/skeleton";
import type { Brand } from "@/data/brands";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import { createCatalogSlug, filterBrandsByCategory } from "@/lib/catalog-relations";
import { filterStorefrontCategories } from "@/lib/categories";
import { brandsApi, categoriesApi, productsApi } from "@/services/api";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Perfumes Online | Purefumes Hyderabad" },
      {
        name: "description",
        content:
          "Browse clearly visible perfumes and personal care products from Purefumes Hyderabad with brand, category, search, and sorting filters.",
      },
      { property: "og:title", content: "Shop Perfumes Online | Purefumes Hyderabad" },
      {
        property: "og:description",
        content:
          "Explore authentic perfumes from Purefumes Hyderabad with secure checkout and delivery across India.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ShopPage,
});

const PAGE_SIZE = 12;

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Latest Arrivals", value: "latest" },
  { label: "Best Sellers", value: "bestseller" },
  { label: "Price Low to High", value: "price-low" },
  { label: "Price High to Low", value: "price-high" },
  { label: "Name A-Z", value: "name" },
] as const;

type Filters = {
  q: string;
  category: string;
  brand: string;
  sort: string;
};

const categoryToApi = (category: string): Brand["category"] | undefined => {
  const normalizedCategory = createCatalogSlug(category);
  return !normalizedCategory || normalizedCategory === "all" ? undefined : normalizedCategory;
};

const getInitialFilters = (): Filters => {
  if (typeof window === "undefined") {
    return { q: "", category: "all", brand: "", sort: "featured" };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    q: searchParams.get("q") || "",
    category: createCatalogSlug(searchParams.get("category") || "all") || "all",
    brand: searchParams.get("brand") || "",
    sort: searchParams.get("sort") || "featured",
  };
};

const syncFiltersToUrl = (filters: Filters) => {
  if (typeof window === "undefined") return;

  const searchParams = new URLSearchParams();
  if (filters.q.trim()) searchParams.set("q", filters.q.trim());
  if (filters.category !== "all") searchParams.set("category", filters.category);
  if (filters.brand) searchParams.set("brand", filters.brand);
  if (filters.sort !== "featured") searchParams.set("sort", filters.sort);

  const nextUrl = searchParams.toString() ? `/shop?${searchParams}` : "/shop";
  window.history.replaceState(null, "", nextUrl);
};

const getPrice = (product: Product) => product.sizes[0]?.price ?? product.price ?? 0;

const sortProducts = (products: Product[], sort: string) => {
  const nextProducts = [...products];

  if (sort === "price-low") {
    return nextProducts.sort((a, b) => getPrice(a) - getPrice(b));
  }

  if (sort === "price-high") {
    return nextProducts.sort((a, b) => getPrice(b) - getPrice(a));
  }

  if (sort === "name") {
    return nextProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sort === "latest") {
    return nextProducts.sort((a, b) => {
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  if (sort === "bestseller") {
    return nextProducts.sort((a, b) => {
      if (a.isBestseller !== b.isBestseller) return a.isBestseller ? -1 : 1;
      return (a.bestsellerOrder || 0) - (b.bestsellerOrder || 0);
    });
  }

  return nextProducts;
};

function ShopPage() {
  const [filters, setFilters] = useState<Filters>(getInitialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    categoriesApi
      .list()
      .then((nextCategories) => {
        if (active) {
          setCategories(nextCategories);
        }
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const normalizedCategory = createCatalogSlug(filters.category) || "all";
    const brandCategory = categoryToApi(normalizedCategory);

    setBrandsLoading(true);

    brandsApi
      .list(brandCategory ? { category: brandCategory } : {})
      .then((nextBrands) => {
        if (active) {
          setBrands(nextBrands);
        }
      })
      .catch(() => {
        if (active) setBrands([]);
      })
      .finally(() => {
        if (active) setBrandsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters.category]);

  useEffect(() => {
    const handlePopState = () => setFilters(getInitialFilters());
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      syncFiltersToUrl(filters);

      try {
        const response = await productsApi.listPaginated({
          page: 1,
          limit: PAGE_SIZE,
          search: filters.q.trim() || undefined,
          category: categoryToApi(filters.category),
          brandId: filters.brand || undefined,
          sort: filters.sort,
        });

        if (!active) return;

        setProducts(response.products);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
        setTotalProducts(response.pagination.total);
      } catch (loadError) {
        if (!active) return;
        setProducts([]);
        setTotalProducts(0);
        setError(loadError instanceof Error ? loadError.message : "Products could not be loaded.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [filters]);

  const displayedProducts = useMemo(
    () => sortProducts(products, filters.sort),
    [filters.sort, products],
  );

  const storefrontCategories = useMemo(
    () =>
      filterStorefrontCategories(categories).map((category) => ({
        ...category,
        slug: category.slug || createCatalogSlug(category.name),
      })),
    [categories],
  );
  const activeCategory = storefrontCategories.find((category) => category.slug === filters.category);
  const availableBrands = useMemo(
    () =>
      filters.category === "all"
        ? [...brands].sort((left, right) => left.name.localeCompare(right.name))
        : filterBrandsByCategory(brands, activeCategory || filters.category),
    [activeCategory, brands, filters.category],
  );
  const activeBrand = availableBrands.find((brand) => brand.id === filters.brand);
  const categoryOptions = useMemo(
    () => [
      { label: "All Categories", value: "all" },
      ...storefrontCategories.map((category) => ({
        label: category.name,
        value: category.slug,
      })),
    ],
    [storefrontCategories],
  );
  const activeCategoryLabel =
    categoryOptions.find((option) => option.value === filters.category)?.label || "All Categories";
  const hasActiveFilters =
    filters.q.trim() ||
    filters.category !== "all" ||
    filters.brand ||
    filters.sort !== "featured";

  useEffect(() => {
    if (!filters.brand || brandsLoading) return;

    const selectedBrandStillAvailable = availableBrands.some((brand) => brand.id === filters.brand);

    if (!selectedBrandStillAvailable) {
      setFilters((current) => (current.brand ? { ...current, brand: "" } : current));
    }
  }, [availableBrands, brandsLoading, filters.brand]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((current) => {
      if (key === "category") {
        return {
          ...current,
          category: createCatalogSlug(value) || "all",
          brand: "",
        };
      }

      return { ...current, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({ q: "", category: "all", brand: "", sort: "featured" });
  };

  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    setError("");

    try {
      const response = await productsApi.listPaginated({
        page: page + 1,
        limit: PAGE_SIZE,
        search: filters.q.trim() || undefined,
        category: categoryToApi(filters.category),
        brandId: filters.brand || undefined,
        sort: filters.sort,
      });

      setProducts((currentProducts) => {
        const seen = new Set(currentProducts.map((product) => product.id));
        return [
          ...currentProducts,
          ...response.products.filter((product) => {
            if (seen.has(product.id)) return false;
            seen.add(product.id);
            return true;
          }),
        ];
      });
      setPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setTotalProducts(response.pagination.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load more products.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <SiteShell>
      <section className="bg-[#f7f3ed] py-6 md:py-8">
        <Container>
          <div className="overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-[#fffaf4] shadow-soft">
            <div className="relative">
              {activeCategory?.image ? (
                <img
                  src={activeCategory.image}
                  alt={activeCategory.name}
                  className="h-48 w-full object-cover object-center sm:h-56"
                />
              ) : (
                <div className="h-44 w-full bg-[linear-gradient(135deg,#f4ede2,#efe7dc)] sm:h-52" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b18]/78 via-[#1e1b18]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-[#fffaf4] sm:p-6">
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#e6c79c]">
                  Home / Shop{activeCategory ? ` / ${activeCategory.name}` : ""}
                </p>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl">
                  {activeBrand?.name || (filters.category === "all" ? "All Fragrances" : activeCategoryLabel)}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#fffaf4]/82">
                  {activeCategory?.description ||
                    "Browse a dynamically managed fragrance catalogue shaped by live categories, brands, and quick filters."}
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 bg-[#f8f3ec] px-4 py-4 sm:px-6">
              <CategoryRail
                categories={storefrontCategories}
                activeSlug={filters.category === "all" ? "" : filters.category}
                allLabel="All Fragrances"
                allHref="/shop"
                hrefBuilder={(category) =>
                  `/shop?category=${category.slug || createCatalogSlug(category.name)}`
                }
              />
            </div>
          </div>

          <div className="sticky top-[7.3rem] z-20 mt-4 rounded-[1.35rem] border border-border/70 bg-[#fffaf4]/95 p-4 shadow-[0_16px_36px_rgba(91,58,41,0.12)] backdrop-blur">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                <label className="relative block min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6b56]" />
                  <input
                    value={filters.q}
                    onChange={(event) => setFilter("q", event.target.value)}
                    placeholder="Search fragrances"
                    className="min-h-11 w-full rounded-xl border border-border bg-[#f7f3ed] py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-gold"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-[#f7f3ed] px-4 py-2.5">
                  <SlidersHorizontal className="h-4 w-4 text-[#c89b63]" />
                  <select
                    value={filters.sort}
                    onChange={(event) => setFilter("sort", event.target.value)}
                    className="min-h-8 bg-transparent text-sm text-foreground outline-none"
                  >
                    {sortOptions.map((sort) => (
                      <option key={sort.value} value={sort.value}>
                        {sort.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-11 rounded-xl border border-border bg-[#f7f3ed] px-4 text-xs uppercase tracking-[0.18em] text-[#5b3a29] transition hover:border-[#c89b63]"
                >
                  Clear
                </button>
              </div>

              <p className="text-xs uppercase tracking-[0.18em] text-[#8b6b56]">
                {loading ? "Loading products" : `${totalProducts || products.length} products`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="hidden min-w-0 xl:block xl:sticky xl:top-[13rem] xl:h-fit">
              <div className="rounded-[var(--radius-panel)] border border-border bg-[#fffaf4] p-4 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                  <p className="fluid-eyebrow flex items-center gap-2 uppercase text-[#8b5f3d]">
                    <Filter className="h-4 w-4" />
                    Filter
                  </p>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="touch-target inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-[0.18em] text-[#8b6b56] hover:text-[#c89b63]"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="fluid-eyebrow uppercase text-[#8b5f3d]">Categories</p>
                    <div className="mt-3 space-y-2">
                      {categoryOptions.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => setFilter("category", category.value)}
                          className={`touch-target block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            filters.category === category.value
                              ? "bg-[#f7f0e5] text-[#c89b63]"
                              : "text-[#5b3a29]/75 hover:bg-[#f7f0e5] hover:text-[#c89b63]"
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                      {!categoriesLoading && categories.length === 0 ? (
                        <p className="px-3 py-2.5 text-sm text-[#8b6b56]">
                          No categories available yet.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="fluid-eyebrow uppercase text-[#8b5f3d]">Brands</p>
                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-2">
                      <button
                        type="button"
                        onClick={() => setFilter("brand", "")}
                        className={`touch-target block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          !filters.brand
                            ? "bg-[#f7f0e5] text-[#c89b63]"
                            : "text-[#5b3a29]/75 hover:bg-[#f7f0e5] hover:text-[#c89b63]"
                        }`}
                      >
                        All Brands
                      </button>
                      {brandsLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-4 w-full" />
                          ))}
                        </div>
                      ) : (
                        availableBrands.map((brand) => (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() => setFilter("brand", brand.id)}
                            className={`touch-target block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                              filters.brand === brand.id
                                ? "bg-[#f7f0e5] text-[#c89b63]"
                                : "text-[#5b3a29]/75 hover:bg-[#f7f0e5] hover:text-[#c89b63]"
                            }`}
                          >
                            {brand.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#8b6b56]">
                  {loading ? "Loading fragrances" : `${totalProducts || products.length} fragrances`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {hasActiveFilters ? (
                    <>
                      {filters.category !== "all" ? (
                        <span className="rounded-full bg-[#f7f0e5] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#8b5f3d]">
                          {activeCategoryLabel}
                        </span>
                      ) : null}
                      {activeBrand ? (
                        <span className="rounded-full bg-[#f7f0e5] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#8b5f3d]">
                          {activeBrand.name}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

              {error ? (
                <div className="mt-6 border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="product-grid mt-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-4">
                      <Skeleton className="aspect-[4/5] rounded-none" />
                      <Skeleton className="mx-auto h-3 w-24" />
                      <Skeleton className="mx-auto h-5 w-40" />
                      <Skeleton className="mx-auto h-3 w-28" />
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && !error && displayedProducts.length === 0 ? (
                <div className="mt-8 border border-dashed border-border bg-[#fffaf4] px-6 py-12 text-center">
                  <p className="font-display text-3xl text-foreground">No fragrances found</p>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#8b6b56]">
                    Products added from the admin panel will appear here automatically when they
                    match your filters.
                  </p>
                </div>
              ) : null}

              {!loading && !error && displayedProducts.length > 0 ? (
                <>
                  <div className="product-grid mt-6">
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} showSize />
                    ))}
                  </div>

                  {page < totalPages ? (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="min-h-11 rounded-full border border-[#8b5f3d] px-6 text-[0.72rem] uppercase tracking-[0.24em] text-[#5b3a29] transition hover:bg-[#8b5f3d] hover:text-[#fffaf4] disabled:opacity-50"
                      >
                        {loadingMore ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
