import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";
import { SizeSelector } from "@/components/product/SizeSelector";
import { WishlistButton } from "@/components/product/WishlistButton";
import type { Size } from "@/data/products";
import perfumeFallback from "@/assets/perfume-1.jpg";

const formatPrice = (value: number) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export const QuickViewModal = memo(function QuickViewModal() {
  const { activeProduct, closeProduct, addToCart } = useApp();
  const { addNotification } = useNotification();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  useEffect(() => {
    setSelectedSize(activeProduct?.sizes[0] ?? null);
  }, [activeProduct]);

  useEffect(() => {
    if (!activeProduct) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProduct();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProduct, closeProduct]);

  const activeImage = useMemo(
    () => activeProduct?.images?.[0] || activeProduct?.image || perfumeFallback,
    [activeProduct],
  );

  const handleAddToCart = useCallback(() => {
    if (!activeProduct || !selectedSize) return;

    addToCart(activeProduct, selectedSize);
    addNotification("Added to cart.");
  }, [activeProduct, addNotification, addToCart, selectedSize]);

  return (
    <AnimatePresence>
      {activeProduct && selectedSize ? (
        <motion.div
          className="fixed inset-0 z-[90] overflow-y-auto bg-navy/70 px-4 py-6 backdrop-blur-md sm:py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProduct();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProduct.name} quick view`}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative mx-auto grid w-[90%] max-w-[900px] overflow-hidden rounded-[20px] border border-border bg-card shadow-luxe md:grid-cols-2"
          >
            <button
              type="button"
              onClick={closeProduct}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/90 text-navy shadow-soft transition hover:border-gold/70 hover:text-gold"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative min-h-[18rem] bg-beige p-4 sm:min-h-[24rem] sm:p-6">
              <OptimizedImage
                src={activeImage}
                alt={activeProduct.name}
                width={900}
                height={1100}
                sizes="(max-width: 768px) 92vw, 42vw"
                className="h-full w-full rounded-[1.25rem] object-cover"
                fallback={
                  <img
                    src={perfumeFallback}
                    alt={activeProduct.name}
                    loading="lazy"
                    className="h-full min-h-[18rem] w-full rounded-[1.25rem] object-cover"
                  />
                }
              />

              <div className="absolute left-6 top-6 rounded-full bg-navy px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.24em] text-beige shadow-soft">
                Quick View
              </div>
            </div>

            <div className="flex max-h-[88dvh] flex-col overflow-y-auto p-5 sm:p-7 md:p-8">
              <div className="pr-12">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.34em] text-gold">
                    {activeProduct.brand}
                  </p>
                  <span className="rounded-full border border-border bg-beige/60 px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-navy/60">
                    {activeProduct.category}
                  </span>
                </div>

                <h2 className="mt-4 font-display text-4xl leading-[1] text-navy sm:text-5xl">
                  {activeProduct.name}
                </h2>

                <p className="mt-4 line-clamp-3 text-sm leading-7 text-navy/68">
                  {activeProduct.description || "A refined fragrance crafted for daily elegance."}
                </p>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-navy p-5 text-beige shadow-soft">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-beige/55">
                  Selected price
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <p className="font-display text-4xl">{formatPrice(selectedSize.price)}</p>
                  <span className="rounded-full bg-beige/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-beige/72">
                    {selectedSize.size}
                  </span>
                  {activeProduct.originalPrice &&
                  activeProduct.originalPrice > selectedSize.price ? (
                    <span className="text-sm text-beige/45 line-through">
                      {formatPrice(activeProduct.originalPrice)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.26em] text-navy/55">
                    Choose size
                  </p>
                  <p className="text-xs text-navy/45">{activeProduct.stock} in stock</p>
                </div>
                <SizeSelector
                  sizes={activeProduct.sizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Button
                  onClick={handleAddToCart}
                  disabled={activeProduct.stock <= 0}
                  className="w-full rounded-xl"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </Button>
                <WishlistButton
                  product={activeProduct}
                  showLabel
                  variant="inline"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});
