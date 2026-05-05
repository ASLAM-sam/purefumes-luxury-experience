import { memo, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/common/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { productsApi } from "@/services/api";
import type { Product } from "@/data/products";

const PAGE_SIZE = 12;

export const FeaturedProducts = memo(function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isActive = true;

    productsApi
      .listPaginated({ page: 1, limit: PAGE_SIZE })
      .then((response) => {
        if (isActive) {
          setProducts(response.products);
          setPage(response.pagination.page);
          setTotalPages(response.pagination.pages);
        }
      })
      .catch(() => {
        if (isActive) setProducts([]);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const featured = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((product) => {
      const key = product.brandId || product.brand;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [products]);

  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const response = await productsApi.listPaginated({
        page: nextPage,
        limit: PAGE_SIZE,
      });

      setProducts((current) => {
        const seen = new Set(current.map((p) => p.id));
        return [
          ...current,
          ...response.products.filter((p) => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          }),
        ];
      });

      setPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section id="featured" className="bg-beige/30 py-12 md:py-20">
      <Container>
        <SectionTitle
          eyebrow="The Collection"
          title="Featured Fragrances"
          subtitle="One signature scent from every house we carry."
        />

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && page < totalPages && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full max-w-xs rounded-full sm:w-auto"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
});