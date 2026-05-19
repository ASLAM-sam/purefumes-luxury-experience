import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/common/Button";
import { CategoryRail } from "@/components/category/CategoryRail";
import { ProductCard } from "@/components/product/ProductCard";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import { filterStorefrontCategories, isGenderCategory } from "@/lib/categories";
import { categoriesApi, productsApi } from "@/services/api";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCategory = async () => {
      setIsLoading(true);
      setError("");
      setPage(1);
      setTotalPages(1);

      try {
        const [categoryResponse, productsResponse, categoriesResponse] = await Promise.all([
          categoriesApi.getBySlug(slug),
          productsApi.listPaginated({ category: slug, page: 1, limit: PAGE_SIZE }),
          categoriesApi.list(),
        ]);

        if (!isActive) return;

        if (isGenderCategory(categoryResponse)) {
          setCategory(null);
          setCategories(filterStorefrontCategories(categoriesResponse));
          setProducts([]);
          setError("This collection is no longer available.");
          return;
        }

        setCategory(categoryResponse);
        setCategories(filterStorefrontCategories(categoriesResponse));
        setProducts(productsResponse.products);
        setPage(productsResponse.pagination.page);
        setTotalPages(productsResponse.pagination.pages);
      } catch (err) {
        if (!isActive) return;

        setCategory(null);
        setCategories([]);
        setProducts([]);
        setError(err instanceof Error ? err.message : "Could not load this category.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      isActive = false;
    };
  }, [slug]);

  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;

    setIsLoadingMore(true);

    try {
      const response = await productsApi.listPaginated({
        category: slug,
        page: page + 1,
        limit: PAGE_SIZE,
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more products.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const subtitle = isLoading
    ? "Loading fragrances from the collection."
    : category
      ? `${category.productCount} fragrances currently flow through this category.`
      : "Category details could not be loaded.";

  const heroImage = category?.image || "";

  return (
    <SiteShell>
      <section className="py-[var(--section-space)]">
        <Container>
          {heroImage ? (
            <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-[#efe7dc] shadow-soft">
              <img
                src={heroImage}
                alt={category?.name || "Category"}
                className="h-[clamp(15rem,36vw,24rem)] w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b18]/72 via-[#1e1b18]/18 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="fluid-eyebrow uppercase text-[#e6c79c]">Home / Category</p>
                <h1 className="mt-3 font-display text-[clamp(2rem,4vw,4rem)]">
                  {category?.name || "Category"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82">
                  {category?.description || subtitle}
                </p>
              </div>
            </div>
          ) : (
            <SectionTitle eyebrow="Category" title={category?.name || "Category"} subtitle={subtitle} />
          )}

          {categories.length ? (
            <div className="mt-4 rounded-[1.25rem] border border-border/70 bg-[#fffaf4] px-4 py-4 shadow-soft">
              <CategoryRail categories={categories} activeSlug={slug} allLabel="Shop All" allHref="/shop" />
            </div>
          ) : null}

          {error ? (
            <div className="mx-auto mt-10 max-w-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="product-grid mt-16">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse space-y-4">
                  <div className="aspect-square bg-[#f1ece6]" />
                  <div className="h-3 w-3/4 bg-[#eee7de]" />
                  <div className="h-3 w-1/2 bg-[#eee7de]" />
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && !error && products.length === 0 ? (
            <div className="mx-auto mt-16 max-w-xl text-center">
              <p className="font-display text-2xl text-ink">No fragrances found</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Products added under {category?.name || "this category"} will appear here automatically.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && products.length > 0 ? (
            <>
              <div className="product-grid mt-16">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    imageLoading={index < 3 ? "eager" : "lazy"}
                    imageFetchPriority={index < 3 ? "high" : "auto"}
                  />
                ))}
              </div>

              {page < totalPages ? (
                <div className="mt-10 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full max-w-xs rounded-full sm:w-auto"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </Container>
      </section>
    </SiteShell>
  );
}
