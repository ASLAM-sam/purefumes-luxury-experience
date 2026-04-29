import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import type { Product } from "@/data/products";

const formatBrandCategory = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const BrandBlock = memo(function BrandBlock({ product }: { product: Product }) {
  const brandLogo = product.brandDetails?.logo || "";
  const brandCategory = product.brandDetails?.category
    ? formatBrandCategory(product.brandDetails.category)
    : "";
  const fallbackLetter =
    product.brandDetails?.fallbackLetter || product.brand.charAt(0).toUpperCase() || "B";

  return (
    <section className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-beige shadow-soft ring-1 ring-border sm:h-24 sm:w-24">
            {brandLogo ? (
              <OptimizedImage
                src={brandLogo}
                alt={product.brand}
                width={112}
                height={112}
                sizes="6rem"
                wrapperClassName="flex items-center justify-center"
                className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
              />
            ) : (
              <span className="font-display text-3xl text-navy sm:text-4xl">{fallbackLetter}</span>
            )}
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">Brand House</p>
            <h2 className="mt-2 font-display text-3xl text-navy sm:text-4xl">{product.brand}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/65">
              Discover the rest of this house and compare how its DNA unfolds across different
              perfumes, sizes, and occasions.
            </p>
            {brandCategory ? (
              <p className="mt-3 text-[0.68rem] uppercase tracking-[0.24em] text-navy/50">
                {brandCategory}
              </p>
            ) : null}
          </div>
        </div>

        {product.brandId ? (
          <Link
            to="/brand/$brandId"
            params={{ brandId: product.brandId }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.28em] text-beige shadow-soft transition hover:opacity-90"
          >
            View all from this brand
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
});
