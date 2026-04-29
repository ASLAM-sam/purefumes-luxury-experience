import { memo, useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/data/products";
import {
  BESTSELLERS_CHANGED_EVENT,
  DATA_EVENT_STORAGE_KEY,
  productsApi,
} from "@/services/api";

type LoadOptions = {
  silent?: boolean;
  forceFresh?: boolean;
};

export const Bestsellers = memo(function Bestsellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showcaseProducts = products.slice(0, 6);

  useEffect(() => {
    const loadBestsellers = async ({ silent = false, forceFresh = true }: LoadOptions = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        if (import.meta.env.DEV && forceFresh) {
          console.debug("[Bestsellers] Fetching fresh bestsellers...");
        }

        const nextProducts = await productsApi.listBestsellers({ forceFresh });
        const combinedProducts = [...nextProducts];

        if (combinedProducts.length < 4) {
          const fallbackProducts = await productsApi.list(
            { page: 1, limit: 4 },
            { forceFresh: false },
          );
          const existingIds = new Set(combinedProducts.map((product) => product.id));

          fallbackProducts.forEach((product) => {
            if (!existingIds.has(product.id) && combinedProducts.length < 4) {
              combinedProducts.push(product);
              existingIds.add(product.id);
            }
          });
        }

        setProducts(combinedProducts);
        setError("");
      } catch (nextError) {
        if (!silent) {
          setProducts([]);
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Bestsellers could not be loaded right now.",
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };

    const refreshFromSignals = () => {
      void loadBestsellers({ silent: true, forceFresh: true });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as { name?: string };

        if (payload.name === BESTSELLERS_CHANGED_EVENT) {
          refreshFromSignals();
        }
      } catch (_error) {
        // Ignore malformed storage payloads from older sessions.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshFromSignals();
      }
    };

    void loadBestsellers({ forceFresh: true });

    const intervalId = window.setInterval(refreshFromSignals, 5000);
    window.addEventListener(BESTSELLERS_CHANGED_EVENT, refreshFromSignals);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshFromSignals);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(BESTSELLERS_CHANGED_EVENT, refreshFromSignals);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshFromSignals);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <section
      id="bestsellers"
      className="bestsellers bg-[linear-gradient(180deg,rgba(235,222,212,0.28),rgba(247,243,239,0.96))] py-[60px] md:py-20"
    >
      <Container className="max-w-[1100px]">
        <SectionTitle
          eyebrow="Most Loved"
          title="Bestsellers"
          subtitle="Most loved fragrances from our collection"
        />

        {loading ? (
          <div className="product-grid mt-12 grid grid-cols-1 justify-center gap-x-3 gap-y-8 sm:grid-cols-2 md:grid-cols-2 md:gap-x-8 md:gap-y-12 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.6rem] border border-border/70 bg-white/80 p-3 shadow-soft md:p-4"
              >
                <Skeleton className="h-[240px] rounded-xl" />
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-4/5" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : showcaseProducts.length > 0 ? (
          <div className="product-grid mt-12 grid grid-cols-1 justify-center gap-x-3 gap-y-8 sm:grid-cols-2 md:grid-cols-2 md:gap-x-8 md:gap-y-12 xl:grid-cols-4">
            {showcaseProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showSize
                variant="bestseller"
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-[1.8rem] border border-border/60 bg-white/70 px-6 py-8 text-center shadow-soft">
            <p className="text-sm text-navy/60">
              {error || "No bestsellers selected yet."}
            </p>
          </div>
        )}
      </Container>
    </section>
  );
});
