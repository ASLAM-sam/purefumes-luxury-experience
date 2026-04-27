import { memo, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock3, Eye, ShoppingBag, Sparkles, Truck, Wind } from "lucide-react";
import type { Product, Size } from "@/data/products";
import { Button } from "@/components/common/Button";
import { SizeSelector } from "@/components/product/SizeSelector";
import { StockBar } from "@/components/product/StockBar";

const formatPrice = (value: number) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

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
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-3 sm:grid-cols-2"}>
      <Button
        onClick={onAddToCart}
        disabled={disabled}
        className={compact ? "px-4 py-3 text-[0.62rem]" : "!bg-beige !text-navy hover:!opacity-90"}
      >
        <ShoppingBag className="h-4 w-4" /> Add to Cart
      </Button>
      <Button
        variant="gold"
        onClick={onBuyNow}
        disabled={disabled}
        className={compact ? "px-4 py-3 text-[0.62rem]" : ""}
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
  viewers: number;
}) {
  const inStock = product.stock > 0;
  const savings = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= selectedSize.price) {
      return 0;
    }

    return Math.round(((product.originalPrice - selectedSize.price) / product.originalPrice) * 100);
  }, [product.originalPrice, selectedSize.price]);
  const topAccords = useMemo(() => product.accords.slice(0, 3), [product.accords]);

  return (
    <>
      <aside className="lg:sticky lg:top-28">
        <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft sm:p-8">
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
              <p className="text-[0.65rem] uppercase tracking-[0.38em] text-gold">{product.brand}</p>
            )}

            <span className="rounded-full border border-border bg-beige/60 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-navy/60">
              {product.category}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl leading-[0.95] text-navy sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-navy/68 sm:text-base">
            {product.description || "A refined fragrance crafted to elevate your daily ritual."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] ${
                inStock
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>

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
                    {formatPrice(selectedSize.price)}
                  </span>
                  <span className="rounded-full bg-beige/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-beige/70">
                    {selectedSize.size}
                  </span>
                  {product.originalPrice && product.originalPrice > selectedSize.price ? (
                    <span className="text-sm text-beige/45 line-through">
                      {formatPrice(product.originalPrice)}
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

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-beige/10 text-gold">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-beige/50">
                      Longevity
                    </p>
                    <p className="mt-1 font-display text-xl text-beige">{product.longevity}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-beige/10 text-gold">
                    <Wind className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-beige/50">
                      Sillage
                    </p>
                    <p className="mt-1 font-display text-xl text-beige">{product.sillage}</p>
                  </div>
                </div>
              </div>
            </div>

            {topAccords.length > 0 ? (
              <div className="mt-6">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/50">
                  Signature accords
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topAccords.map((accord) => (
                    <span
                      key={accord.name}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-beige/80"
                    >
                      {accord.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-navy/55">Choose size</p>
              <p className="text-xs uppercase tracking-[0.18em] text-navy/45">
                Price updates instantly
              </p>
            </div>
            <SizeSelector sizes={product.sizes} selected={selectedSize} onSelect={onSelectSize} />
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-border/60 bg-beige/30 p-5">
            <StockBar stock={product.stock} />
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-border/60 bg-background/70 p-5 shadow-soft">
            <PurchaseButtons disabled={!inStock} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />

            <div className="mt-4 flex items-center gap-2 text-sm text-navy/60" aria-live="polite">
              <Eye className="h-4 w-4 text-gold" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={viewers}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="inline-flex items-center gap-1"
                >
                  <span className="font-semibold text-gold">{viewers}</span>
                  shoppers are viewing this fragrance
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 p-3 shadow-[0_-16px_35px_-24px_rgba(7,32,63,0.55)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-soft">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-navy/45">
                {selectedSize.size}
              </p>
              <p className="mt-1 font-display text-2xl text-navy">{formatPrice(selectedSize.price)}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[0.58rem] uppercase tracking-[0.22em] ${
                inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {inStock ? "Ready to order" : "Unavailable"}
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
