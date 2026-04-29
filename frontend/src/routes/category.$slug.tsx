import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/common/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { productsApi } from "@/services/api";
import type { Product } from "@/data/products";

const PAGE_SIZE = 12;

const slugMap: Record<string, Product["category"]> = {
  "middle-eastern": "Middle Eastern",
  designer: "Designer",
  niche: "Niche",
};

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = slugMap[params.slug];
    if (!category) throw notFound();
    return { category };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-40 text-center font-display text-3xl">Category not found</div>
    </SiteShell>
  ),
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
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
        const response = await productsApi.listPaginated({ category, page: 1, limit: PAGE_SIZE });

        if (!isActive) return;

        setProducts(response.products);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
      } catch (err) {
        if (!isActive) return;

        setProducts([]);
        setError(err instanceof Error ? err.message : "Could not load this category.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      isActive = false;
    };
  }, [category]);

  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;

    setIsLoadingMore(true);

    try {
      const response = await productsApi.listPaginated({
        category,
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
    : `${products.length} fragrances curated within this realm.`;

  return (
    <SiteShell>
      <section className="py-20">
        <Container>
          <SectionTitle eyebrow="Category" title={category} subtitle={subtitle} />

          {error ? (
            <div className="mx-auto mt-10 max-w-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="product-grid mt-16 grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse space-y-4">
                  <div className="aspect-[4/5] bg-[#f1ece6]" />
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
                Products added under {category} will appear here automatically.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && products.length > 0 ? (
            <>
              <div className="product-grid mt-16 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-2 md:gap-x-8 md:gap-y-16 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
