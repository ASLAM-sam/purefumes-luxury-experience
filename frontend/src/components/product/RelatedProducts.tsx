import { memo, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export const RelatedProducts = memo(function RelatedProducts({
  products,
  loading,
  error,
  brandName,
}: {
  products: Product[];
  loading: boolean;
  error: string;
  brandName: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = useCallback((direction: "prev" | "next") => {
    const node = scrollerRef.current;
    if (!node) return;

    const amount = node.clientWidth * 0.85 * (direction === "next" ? 1 : -1);
    node.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">Related Products</p>
          <h2 className="mt-2 font-display text-3xl text-navy sm:text-4xl">
            More from {brandName}
          </h2>
        </div>

        {products.length > 1 && !loading ? (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByAmount("prev")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-navy shadow-soft transition hover:-translate-y-0.5 hover:border-gold/60"
              aria-label="Scroll related products left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("next")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-navy shadow-soft transition hover:-translate-y-0.5 hover:border-gold/60"
              aria-label="Scroll related products right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[78vw] shrink-0 snap-start sm:min-w-[20rem] lg:min-w-[22rem]"
            >
              <div className="animate-pulse space-y-4">
                <div className="aspect-[3/4] rounded-xl bg-[#f1ece6]" />
                <div className="h-3 w-24 rounded bg-[#eee7de]" />
                <div className="h-6 w-40 rounded bg-[#eee7de]" />
                <div className="h-3 w-28 rounded bg-[#eee7de]" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && products.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-border/70 bg-card/60 px-5 py-12 text-center">
          <p className="font-display text-2xl text-navy">No related products yet</p>
          <p className="mt-3 text-sm leading-6 text-navy/55">
            More fragrances from {brandName} will appear here automatically.
          </p>
        </div>
      ) : null}

      {!loading && !error && products.length > 0 ? (
        <div
          ref={scrollerRef}
          className="mt-8 flex gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[78vw] shrink-0 snap-start sm:min-w-[20rem] lg:min-w-[22rem]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
});
