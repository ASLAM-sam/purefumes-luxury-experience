import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ProductCard } from "@/components/product/ProductCard";
import { productsApi } from "@/services/api";
import type { Product } from "@/data/products";

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
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCategory = async () => {
      setIsLoading(true);
      setError("");

      try {
        const categoryProducts = await productsApi.list({ category });

        if (!isActive) return;

        setProducts(categoryProducts);
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
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </Container>
      </section>
    </SiteShell>
  );
}
