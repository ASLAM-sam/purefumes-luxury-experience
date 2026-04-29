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
        if (isActive) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
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
      const response = await productsApi.listPaginated({ page: nextPage, limit: PAGE_SIZE });
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
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section id="featured" className="bg-beige/30 py-14 md:py-20">
      <Container>
        <SectionTitle
          eyebrow="The Collection"
          title="Featured Fragrances"
          subtitle="One signature scent from every house we carry."
        />
        {loading ? (
          <div className="product-grid mt-12 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-[240px] rounded-xl" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-4/5" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid mt-12 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && page < totalPages ? (
          <div className="mt-10 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full max-w-xs rounded-full sm:w-auto"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        ) : null}
      </Container>
    </section>
  );
});
