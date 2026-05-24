import { memo, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Eye, ShoppingBag, Sparkles, Truck } from "lucide-react";
import type { Product, Size } from "@/data/products";
import { Button } from "@/components/common/Button";
import { SizeSelector } from "@/components/product/SizeSelector";
import { WishlistButton } from "@/components/product/WishlistButton";
import { formatINR } from "@/lib/money";

function PurchaseButtons({
  disabled,
  compact = false,
  onAddToCart,
  onBuyNow,
}: {
  disabled: boolean;
  compact?: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 min-[380px]:gap-3"
          : "grid gap-3 sm:grid-cols-2"
      }
    >
      <Button
        onClick={onAddToCart}
        disabled={disabled}
        className={
          compact
            ? "add-to-cart-btn min-h-[48px] min-w-0 px-2 py-3 text-[0.66rem] font-semibold tracking-[0.08em] min-[380px]:min-h-[52px] min-[380px]:px-4 min-[380px]:text-[0.72rem] min-[380px]:tracking-[0.14em]"
            : "add-to-cart-btn min-h-[52px] px-4 py-3 text-sm font-semibold sm:min-h-[52px] sm:px-8 sm:py-4 !bg-beige !text-navy hover:!opacity-90"
        }
      >
        <ShoppingBag className="h-4 w-4" /> Add to Cart
      </Button>
      <Button
        variant="gold"
        onClick={onBuyNow}
        disabled={disabled}
        className={
          compact
            ? "quick-shop-btn buy-now-jiggle min-h-[48px] min-w-0 px-2 py-3 text-[0.68rem] font-semibold tracking-[0.08em] min-[380px]:min-h-[52px] min-[380px]:px-4 min-[380px]:text-[0.78rem] min-[380px]:tracking-[0.14em]"
            : "quick-shop-btn buy-now-jiggle min-h-[56px] px-6 py-4 text-[15px] font-semibold sm:min-h-[52px] sm:px-8 sm:py-4 sm:text-sm flex sm:block"
        }
      >
        <Sparkles className="h-4 w-4" /> Buy Now
      </Button>
    </div>
  );
}

export const ProductInfo = memo(function ProductInfo({
  product,
  selectedSize,
  onSelectSize,
  onAddToCart,
  onBuyNow,
  viewers,
}: {
  product: Product;
  selectedSize: Size;
  onSelectSize: (size: Size) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  viewers: number | null;
}) {
  const inStock = product.stock > 0;
  const viewerCount = viewers ?? 1;
  const viewersReady = viewers !== null;
  const savings = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= selectedSize.price) {
      return 0;
    }

    return Math.round(((product.originalPrice - selectedSize.price) / product.originalPrice) * 100);
  }, [product.originalPrice, selectedSize.price]);

  return (
    <>
      <aside className="lg:sticky lg:top-28">
        <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {product.brandId ? (
                <Link
                  to="/brand/$brandId"
                  params={{ brandId: product.brandId }}
                  className="text-[0.65rem] uppercase tracking-[0.38em] text-gold transition hover:text-navy"
                >
                  {product.brand}
                </Link>
              ) : (
                <p className="text-[0.65rem] uppercase tracking-[0.38em] text-gold">
                  {product.brand}
                </p>
              )}

              <span className="rounded-full border border-border bg-beige/60 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-navy/60">
                {product.category}
              </span>
            </div>

            <WishlistButton product={product} showLabel variant="inline" className="self-start" />
          </div>

          <h1 className="mt-4 font-display text-3xl leading-[0.95] text-navy sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-navy/68 sm:text-base">
            {product.description || "A refined fragrance crafted to elevate your daily ritual."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!inStock ? (
              <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy shadow-[0_10px_24px_rgba(201,161,74,0.12)]">
                Sold Out
              </span>
            ) : null}

            <span className="inline-flex items-center gap-2 rounded-full bg-beige/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/70 ring-1 ring-border/60">
              <BadgeCheck className="h-3.5 w-3.5 text-gold" />
              Authentic decants
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-beige/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/70 ring-1 ring-border/60">
              <Truck className="h-3.5 w-3.5 text-gold" />
              Fast dispatch
            </span>
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-navy p-6 text-beige shadow-luxe">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-beige/60">
                  Selected size
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <span className="font-display text-4xl text-beige sm:text-5xl">
                    {formatINR(selectedSize.price)}
                  </span>
                  <span className="rounded-full bg-beige/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-beige/70">
                    {selectedSize.size}
                  </span>
                  {product.originalPrice && product.originalPrice > selectedSize.price ? (
                    <span className="text-sm text-beige/45 line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                  ) : null}
                </div>
              </div>

              {savings > 0 ? (
                <div className="rounded-full bg-gold px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy">
                  Save {savings}%
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-navy/55">Choose size</p>
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-navy/45 sm:text-xs sm:tracking-[0.18em]">
                Price updates instantly
              </p>
            </div>
            <SizeSelector sizes={product.sizes} selected={selectedSize} onSelect={onSelectSize} />
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-border/60 bg-background/70 p-5 shadow-soft">
            <PurchaseButtons disabled={!inStock} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />

            <div className="mt-4 flex items-center gap-2 text-sm text-navy/60" aria-live="polite">
              <Eye className="h-4 w-4 text-gold" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={viewersReady ? viewerCount : "pending-viewers"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: viewersReady ? 1 : 0, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="inline-flex min-h-6 items-center gap-1"
                  aria-hidden={!viewersReady}
                >
                  <span className="font-semibold text-gold">{viewerCount}</span>
                  shoppers are viewing this fragrance
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-[var(--mobile-bottom-nav-height)] z-40 border-t border-border/70 bg-background/95 p-3 shadow-[0_-16px_35px_-24px_rgba(7,32,63,0.55)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-3 py-3 shadow-soft min-[380px]:px-4">
            <div className="min-w-0">
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-navy/45">
                {selectedSize.size}
              </p>
              <p className="mt-1 font-display text-xl text-navy min-[380px]:text-2xl">
                {formatINR(selectedSize.price)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[0.54rem] uppercase tracking-[0.14em] min-[380px]:px-3 min-[380px]:text-[0.58rem] min-[380px]:tracking-[0.22em] ${
                inStock
                  ? "bg-beige/70 text-navy/70 ring-1 ring-border/60"
                  : "border border-gold/35 bg-gold/10 text-navy"
              }`}
            >
              {inStock ? "Ready to order" : "Sold Out"}
            </span>
          </div>

          <PurchaseButtons
            disabled={!inStock}
            compact
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        </div>
      </div>
    </>
  );
});
