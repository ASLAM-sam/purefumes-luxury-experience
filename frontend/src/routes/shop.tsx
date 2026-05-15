import { createFileRoute } from "@tanstack/react-router";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { SiteShell } from "@/components/layout/SiteShell";
import { Skeleton } from "@/components/ui/skeleton";
import type { Brand } from "@/data/brands";
import type { Product } from "@/data/products";
import { brandsApi, productsApi } from "@/services/api";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

const PAGE_SIZE = 12;

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Middle Eastern", value: "middle-eastern" },
  { label: "Designer", value: "designer" },
  { label: "Niche", value: "niche" },
] as const;

const genderOptions = ["all", "Men", "Women", "Unisex"] as const;

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
  gender: string;
  sort: string;
};

const categoryToApi = (category: string): Product["category"] | undefined => {
  if (category === "middle-eastern") return "Middle Eastern";
  if (category === "designer") return "Designer";
  if (category === "niche") return "Niche";
  return undefined;
};

const getInitialFilters = (): Filters => {
  if (typeof window === "undefined") {
    return { q: "", category: "all", brand: "", gender: "all", sort: "featured" };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "all",
    brand: searchParams.get("brand") || "",
    gender: searchParams.get("gender") || "all",
    sort: searchParams.get("sort") || "featured",
  };
};

const syncFiltersToUrl = (filters: Filters) => {
  if (typeof window === "undefined") return;

  const searchParams = new URLSearchParams();
  if (filters.q.trim()) searchParams.set("q", filters.q.trim());
  if (filters.category !== "all") searchParams.set("category", filters.category);
  if (filters.brand) searchParams.set("brand", filters.brand);
  if (filters.gender !== "all") searchParams.set("gender", filters.gender);
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
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    brandsApi
      .list()
      .then((nextBrands) => {
        if (active) {
          setBrands([...nextBrands].sort((a, b) => a.name.localeCompare(b.name)));
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
  }, []);

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
          gender: filters.gender === "all" ? undefined : filters.gender,
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

  const activeBrand = brands.find((brand) => brand.id === filters.brand);
  const activeCategoryLabel =
    categoryOptions.find((option) => option.value === filters.category)?.label || "All Categories";
  const hasActiveFilters =
    filters.q.trim() ||
    filters.category !== "all" ||
    filters.brand ||
    filters.gender !== "all" ||
    filters.sort !== "featured";

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ q: "", category: "all", brand: "", gender: "all", sort: "featured" });
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
        gender: filters.gender === "all" ? undefined : filters.gender,
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
      <section className="bg-[#f7f3ed] py-14 md:py-20">
        <Container>
          <div className="text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.36em] text-gold">
              The Collection
            </p>
            <h1 className="mt-4 font-display text-5xl leading-none text-foreground md:text-6xl">
              {activeBrand?.name || (filters.category === "all" ? "All Fragrances" : activeCategoryLabel)}
            </h1>
            <div className="mx-auto mt-6 h-px w-24 gold-line" />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <aside className="h-fit lg:sticky lg:top-32">
              <div className="border border-border bg-[#fffaf4] p-5 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.3em] text-[#8b5f3d]">
                    <Filter className="h-4 w-4" />
                    Filter
                  </p>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.18em] text-[#8b6b56] hover:text-[#c89b63]"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  ) : null}
                </div>

                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6b56]" />
                  <input
                    value={filters.q}
                    onChange={(event) => setFilter("q", event.target.value)}
                    placeholder="Search fragrances"
                    className="w-full border border-border bg-[#f7f3ed] py-3 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-gold"
                  />
                </label>

                <div className="mt-7 space-y-8">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.3em] text-[#8b5f3d]">
                      Category
                    </p>
                    <div className="mt-3 space-y-2">
                      {categoryOptions.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => setFilter("category", category.value)}
                          className={`block w-full text-left text-sm transition ${
                            filters.category === category.value
                              ? "text-[#c89b63]"
                              : "text-[#5b3a29]/75 hover:text-[#c89b63]"
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.3em] text-[#8b5f3d]">
                      Gender
                    </p>
                    <div className="mt-3 space-y-2">
                      {genderOptions.map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => setFilter("gender", gender)}
                          className={`block w-full text-left text-sm transition ${
                            filters.gender === gender
                              ? "text-[#c89b63]"
                              : "text-[#5b3a29]/75 hover:text-[#c89b63]"
                          }`}
                        >
                          {gender === "all" ? "All" : gender}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.3em] text-[#8b5f3d]">
                      Brands
                    </p>
                    <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-2">
                      <button
                        type="button"
                        onClick={() => setFilter("brand", "")}
                        className={`block w-full text-left text-sm transition ${
                          !filters.brand
                            ? "text-[#c89b63]"
                            : "text-[#5b3a29]/75 hover:text-[#c89b63]"
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
                        brands.map((brand) => (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() => setFilter("brand", brand.id)}
                            className={`block w-full text-left text-sm transition ${
                              filters.brand === brand.id
                                ? "text-[#c89b63]"
                                : "text-[#5b3a29]/75 hover:text-[#c89b63]"
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
              <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#8b6b56]">
                  {loading ? "Loading fragrances" : `${totalProducts || products.length} fragrances`}
                </p>
                <label className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-[#c89b63]" />
                  <select
                    value={filters.sort}
                    onChange={(event) => setFilter("sort", event.target.value)}
                    className="min-h-11 border border-border bg-[#fffaf4] px-4 text-sm text-foreground outline-none transition focus:border-gold"
                  >
                    {sortOptions.map((sort) => (
                      <option key={sort.value} value={sort.value}>
                        {sort.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? (
                <div className="mt-8 border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="product-grid mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
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
                <div className="mt-10 border border-dashed border-border bg-[#fffaf4] px-6 py-14 text-center">
                  <p className="font-display text-3xl text-foreground">No fragrances found</p>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#8b6b56]">
                    Products added from the admin panel will appear here automatically when they
                    match your filters.
                  </p>
                </div>
              ) : null}

              {!loading && !error && displayedProducts.length > 0 ? (
                <>
                  <div className="product-grid mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} showSize />
                    ))}
                  </div>

                  {page < totalPages ? (
                    <div className="mt-10 flex justify-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="min-h-12 border border-[#8b5f3d] px-8 text-[0.72rem] uppercase tracking-[0.28em] text-[#5b3a29] transition hover:bg-[#8b5f3d] hover:text-[#fffaf4] disabled:opacity-50"
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
