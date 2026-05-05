import { memo, useCallback, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { useApp } from "@/context/AppContext";
import type { Product } from "@/data/products";
import { WishlistButton } from "@/components/product/WishlistButton";
import perfumeFallback from "@/assets/perfume-1.jpg";

const QuickViewButton = memo(function QuickViewButton({ product }: { product: Product }) {
  const { openProduct } = useApp();

  const handleQuickView = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      openProduct(product);
    },
    [openProduct, product],
  );

  return (
    <button
      type="button"
      onClick={handleQuickView}
      className="absolute bottom-2 left-2 right-2 z-10 inline-flex items-center justify-center gap-1 rounded-md bg-navy px-2 py-1 text-[0.55rem] font-medium uppercase tracking-[0.12em] text-beige shadow-soft transition duration-300 ease-in-out hover:bg-[#0d2b53] md:inset-x-4 md:bottom-4 md:px-3 md:py-2 md:text-[0.62rem] md:opacity-0 md:group-hover/card:opacity-100"
      aria-label={`Quick view ${product.name}`}
    >
      <Eye className="h-3 w-3 md:h-4 md:w-4" />
      Quick View
    </button>
  );
});

type ProductCardProps = {
  product: Product;
  showSize?: boolean;
  variant?: "default" | "bestseller";
};

export const ProductCard = memo(function ProductCard({
  product,
  showSize = false,
  variant = "default",
}: ProductCardProps) {
  const startPrice = product.sizes[0]?.price ?? product.price ?? 0;
  const formattedPrice = Number(startPrice || 0).toLocaleString("en-IN");
  const featuredSize =
    product.sizes.find((size) => {
      const normalizedSize = String(size.size || "").trim().toLowerCase();
      return normalizedSize && normalizedSize !== "standard";
    })?.size || "";

  const isBestsellerCard = variant === "bestseller";
  const imageSrc = product.image || product.images?.[0] || perfumeFallback;

  return (
    <motion.article
      className={`product-card group/card relative w-full overflow-hidden rounded-[16px] bg-white transition-all duration-300 ease-in-out ${
        isBestsellerCard
          ? "border border-border/70 p-2 shadow-soft hover:border-gold/30 hover:shadow-[0_10px_25px_rgba(0,0,0,0.1)] md:p-4"
          : "shadow-soft hover:shadow-[0_10px_25px_rgba(0,0,0,0.1)]"
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      viewport={{ once: true }}
    >
      {isBestsellerCard && (
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent opacity-0 transition group-hover/card:opacity-100" />
      )}

      <div className="relative">
        <Link to="/product/$id" params={{ id: product.id }} className="block">
          <div className="relative h-40 md:h-[240px] overflow-hidden rounded-lg bg-beige shadow-soft">
            <OptimizedImage
              src={imageSrc}
              alt={product.name}
              width={800}
              height={1024}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 31vw"
              className="h-full w-full object-cover transition duration-300 group-hover/card:scale-105"
              fallback={
                <img
                  src={perfumeFallback}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              }
            />

            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />

            <span className="absolute left-2 top-2 rounded-full bg-navy/80 px-2 py-0.5 text-[0.45rem] uppercase tracking-[0.12em] text-beige md:left-4 md:top-4 md:text-[0.6rem]">
              {product.category}
            </span>

            {product.originalPrice && (
              <span className="absolute left-2 top-7 rounded-full bg-gold px-2 py-0.5 text-[0.45rem] uppercase text-navy md:left-4 md:top-12 md:text-[0.6rem]">
                Sale
              </span>
            )}
          </div>
        </Link>

        <div className="absolute right-2 top-2 z-10 md:right-4 md:top-4">
          <WishlistButton product={product} />
        </div>

        <QuickViewButton product={product} />
      </div>

      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="px-2 pt-2 pb-3 md:px-4 md:pt-4 md:pb-5">
          {isBestsellerCard && (
            <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.5rem] uppercase text-gold">
              Bestseller
            </span>
          )}

          <p className="truncate text-[0.5rem] uppercase tracking-[0.15em] text-navy/60 md:text-[0.65rem]">
            {product.brand}
          </p>

          <h3 className="mt-1 text-sm md:text-lg font-medium text-navy">
            {product.name}
          </h3>

          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            From <span className="font-medium text-gold">Rs. {formattedPrice}</span>
          </p>

          {showSize && featuredSize && (
            <p className="mt-1 text-[0.55rem] uppercase text-navy/50 md:text-[0.7rem]">
              Size {featuredSize}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
});