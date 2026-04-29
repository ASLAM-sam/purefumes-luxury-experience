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
      className="absolute inset-x-3 bottom-3 z-10 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-beige shadow-soft transition duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#0d2b53] hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 md:inset-x-4 md:bottom-4 md:opacity-0 md:group-hover/card:opacity-100"
      aria-label={`Quick view ${product.name}`}
    >
      <Eye className="h-4 w-4" />
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
      className={`product-card group/card relative w-full max-w-full min-w-0 overflow-hidden rounded-[18px] bg-white transition-all duration-300 ease-in-out ${
        isBestsellerCard
          ? "border border-border/70 p-3 shadow-soft hover:border-gold/30 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] md:p-4"
          : "shadow-soft hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {isBestsellerCard ? (
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent opacity-0 transition duration-300 ease-in-out group-hover/card:opacity-100" />
      ) : null}

      <div className="relative">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="group/link block min-w-0 text-left"
        >
          <div
            className={`product-card-media relative h-[240px] overflow-hidden rounded-xl bg-beige shadow-soft transition duration-300 ease-in-out group-hover/card:-translate-y-1 group-hover/card:shadow-lg ${
              isBestsellerCard ? "ring-1 ring-border/40 group-hover/card:ring-gold/35" : ""
            }`}
          >
            <OptimizedImage
              src={imageSrc}
              alt={product.name}
              width={800}
              height={1024}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 31vw"
              className="product-card-image h-full w-full object-cover transition duration-300 ease-in-out group-hover/card:scale-105"
              fallback={
                <img
                  src={perfumeFallback}
                  alt={product.name}
                  loading="lazy"
                  className="product-card-image h-full w-full object-cover"
                />
              }
            />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent opacity-70" />
          <span className="product-card-badge absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-navy/80 px-2 py-0.5 text-[0.48rem] uppercase tracking-[0.14em] text-beige md:left-4 md:top-4 md:max-w-none md:px-3 md:py-1 md:text-[0.6rem] md:tracking-[0.3em]">
            {product.category}
          </span>
          {product.originalPrice && (
            <span className="product-card-sale absolute left-2 top-8 rounded-full bg-gold px-2 py-0.5 text-[0.48rem] font-medium uppercase tracking-[0.14em] text-navy md:left-4 md:top-14 md:px-3 md:py-1 md:text-[0.6rem] md:tracking-[0.22em]">
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

      <Link to="/product/$id" params={{ id: product.id }} className="group/link block min-w-0 text-left">
        <div className="product-card-content px-3 pb-4 pt-3 md:px-4 md:pb-5 md:pt-5">
          {isBestsellerCard ? (
            <span className="inline-flex items-center rounded-full border border-gold/30 bg-[rgba(212,175,55,0.12)] px-3 py-1 text-[0.56rem] uppercase tracking-[0.22em] text-gold shadow-[0_0_0_rgba(212,175,55,0.3)] transition duration-300 ease-in-out group-hover/card:border-gold/60 group-hover/card:shadow-[0_0_16px_rgba(212,175,55,0.34)]">
              Bestseller
            </span>
          ) : null}
          <p
            className={`product-card-brand truncate text-[0.55rem] uppercase tracking-[0.18em] text-navy/55 md:text-[0.65rem] md:tracking-[0.32em] ${
              isBestsellerCard ? "mt-3" : ""
            }`}
          >
            {product.brand}
          </p>
          <h3 className="product-title mt-2 font-display text-2xl text-navy transition duration-300 ease-in-out group-hover/link:text-gold">
            {product.name}
          </h3>
          <p className="product-price mt-2 text-sm text-muted-foreground">
            From <span className="font-medium text-gold">Rs. {formattedPrice}</span>
          </p>
          {showSize && featuredSize ? (
            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.22em] text-navy/45 md:text-[0.68rem]">
              Size {featuredSize}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
});
