import { memo } from "react";
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
  return (
    <section className="related-products mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">Related Products</p>
          <h2 className="mt-2 font-display text-3xl text-navy sm:text-4xl">
            More from {brandName}
          </h2>
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="related-grid mt-8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-0"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-[240px] rounded-xl bg-[#f1ece6]" />
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
        <div className="related-grid mt-8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
});
