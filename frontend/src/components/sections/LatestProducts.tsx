import { memo, useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/data/products";
import { useRenderInstrumentation } from "@/hooks/useRenderInstrumentation";
import { DATA_EVENT_STORAGE_KEY, LATEST_PRODUCTS_CHANGED_EVENT, productsApi } from "@/services/api";

type LoadOptions = {
  silent?: boolean;
  forceFresh?: boolean;
};

export const LatestProducts = memo(function LatestProducts() {
  useRenderInstrumentation("LatestProducts");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadLatest = async ({ silent = false, forceFresh = false }: LoadOptions = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const nextProducts = await productsApi.listLatest({ forceFresh });
        if (isActive) {
          setProducts(nextProducts.filter((product) => product.isLatest).slice(0, 8));
        }
      } catch (_error) {
        if (isActive && !silent) {
          setProducts([]);
        }
      } finally {
        if (isActive && !silent) {
          setLoading(false);
        }
      }
    };

    const refreshLatest = () => {
      void loadLatest({ silent: true, forceFresh: true });
    };

    const refreshLatestFromFocus = () => {
      void loadLatest({ silent: true, forceFresh: false });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) return;

      try {
        const payload = JSON.parse(event.newValue) as { name?: string };
        if (payload.name === LATEST_PRODUCTS_CHANGED_EVENT) {
          refreshLatest();
        }
      } catch (_error) {
        // Ignore stale or malformed cross-tab events.
      }
    };

    void loadLatest();
    window.addEventListener(LATEST_PRODUCTS_CHANGED_EVENT, refreshLatest);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshLatestFromFocus);

    return () => {
      isActive = false;
      window.removeEventListener(LATEST_PRODUCTS_CHANGED_EVENT, refreshLatest);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshLatestFromFocus);
    };
  }, []);

  if (!loading && !products.length) {
    return null;
  }

  return (
    <section id="latest-arrivals" className="bg-background py-[var(--section-space)]">
      <Container>
        <SectionTitle
          eyebrow="Just In"
          title="Latest Arrivals"
          subtitle="Newly curated fragrances ready to discover."
        />

        {loading ? (
          <div className="product-grid mt-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.6rem] border border-border/70 bg-white/80 p-3 shadow-soft md:p-4"
              >
                <Skeleton className="aspect-square rounded-xl" />
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-4/5" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid mt-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showSize variant="bestseller" />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
});
