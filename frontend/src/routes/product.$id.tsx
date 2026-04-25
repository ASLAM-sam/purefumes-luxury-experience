import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Wind, ShoppingBag, Heart, ChevronLeft, Eye } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { AccordBars } from "@/components/product/AccordBars";
import { NotesGrid } from "@/components/product/NotesGrid";
import { SeasonBadges } from "@/components/product/SeasonBadges";
import { SizeSelector } from "@/components/product/SizeSelector";
import { StockBar } from "@/components/product/StockBar";
import { productsApi } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await productsApi.get(params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-40 text-center">
        <h1 className="font-display text-5xl text-navy">Product not found</h1>
        <Link to="/" className="inline-block mt-6 text-gold underline-slide">
          Return home
        </Link>
      </div>
    </SiteShell>
  ),
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="py-40 text-center text-navy">Error: {error.message}</div>
    </SiteShell>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart } = useApp();
  const { addNotification } = useNotification();
  const nav = useNavigate();
  const [size, setSize] = useState(product.sizes[0]);
  const [viewers, setViewers] = useState(10);
  const galleryImages = useMemo(
    () => (product.images?.length ? product.images : [product.image]).filter(Boolean),
    [product.image, product.images],
  );
  const [mainImage, setMainImage] = useState(galleryImages[0] || "");

  useEffect(() => {
    setSize(product.sizes[0]);
    setMainImage(galleryImages[0] || "");
  }, [galleryImages, product]);

  useEffect(() => {
    let timeoutId: number | null = null;

    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        setViewers(Math.floor(Math.random() * 21) + 5);
        scheduleNext();
      }, Math.floor(Math.random() * 5000) + 5000);
    };

    setViewers(Math.floor(Math.random() * 21) + 5);
    scheduleNext();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const savings = useMemo(() => {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - size.price) / product.originalPrice) * 100);
  }, [product.originalPrice, size.price]);

  const onAddToCart = useCallback(() => {
    addToCart(product, size);
    addNotification("Added to cart.");
  }, [addNotification, addToCart, product, size]);

  const onViewCart = useCallback(() => {
    addToCart(product, size);
    nav({ to: "/cart" });
  }, [addToCart, nav, product, size]);

  const handleBuyNow = useCallback((currentProduct: typeof product) => {
    nav({
      to: "/checkout",
      state: {
        buyNowProduct: currentProduct,
        buyNowSize: size,
      },
    });
  }, [nav, size]);

  return (
    <SiteShell>
      <section className="py-12 md:py-16">
        <Container>
          <Link
            to="/category/$slug"
            params={{ slug: product.category.toLowerCase().replace(" ", "-") }}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-navy/60 hover:text-navy"
          >
            <ChevronLeft className="w-4 h-4" /> Back to {product.category}
          </Link>

          <div className="mt-8 grid lg:grid-cols-2 gap-12">
            {/* LEFT — image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="sticky top-32">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-beige shadow-luxe">
                  <img
                    src={mainImage || product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  {product.originalPrice && savings > 0 && (
                    <div className="absolute left-5 top-5 rounded-full bg-navy px-4 py-2 text-xs uppercase tracking-[0.2em] text-beige">
                      {savings}% Off
                    </div>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {galleryImages.slice(0, 3).map((image, index) => {
                      const selected = image === mainImage;

                      return (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setMainImage(image)}
                          className={`aspect-square overflow-hidden rounded-lg border bg-beige transition ${
                            selected ? "border-navy shadow-soft" : "border-border hover:border-gold"
                          }`}
                          aria-label={`View product image ${index + 1}`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* RIGHT — details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <header>
                <p className="text-[0.65rem] tracking-[0.4em] text-gold uppercase">
                  {product.brand}
                </p>
                <h1 className="font-display text-5xl md:text-6xl text-navy mt-2 leading-[1.05]">
                  {product.name}
                </h1>
                <p className="mt-4 text-base text-navy/70 leading-relaxed">{product.description}</p>
              </header>

              {/* MAIN ACCORDS */}
              <section className="rounded-2xl bg-card p-6 shadow-soft border border-border/60">
                <p className="text-[0.65rem] tracking-[0.3em] text-navy/60 uppercase mb-5 font-medium">
                  Main Accords
                </p>
                <AccordBars accords={product.accords} />
              </section>

              {/* FRAGRANCE PROFILE */}
              <section className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-card p-5 shadow-soft border border-border/60 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-beige flex items-center justify-center">
                    <Clock className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.25em] uppercase text-navy/60">
                      Longevity
                    </p>
                    <p className="font-display text-xl text-navy">{product.longevity}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-card p-5 shadow-soft border border-border/60 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-beige flex items-center justify-center">
                    <Wind className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.25em] uppercase text-navy/60">
                      Sillage
                    </p>
                    <p className="font-display text-xl text-navy">{product.sillage}</p>
                  </div>
                </div>
              </section>

              {/* NOTES GRID */}
              <section>
                <p className="text-[0.65rem] tracking-[0.3em] text-navy/60 uppercase mb-4 font-medium">
                  Fragrance Pyramid
                </p>
                <NotesGrid
                  top={product.topNotes}
                  middle={product.middleNotes}
                  base={product.baseNotes}
                />
              </section>

              {product.bestTime.length > 0 && (
                <section>
                  <p className="text-[0.65rem] tracking-[0.3em] text-navy/60 uppercase mb-3 font-medium">
                    Best Time
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.bestTime.map((time) => (
                      <span
                        key={time}
                        className="rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.2em] text-navy/70 shadow-soft"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* SEASONS */}
              <section>
                <p className="text-[0.65rem] tracking-[0.3em] text-navy/60 uppercase mb-3 font-medium">
                  Seasons
                </p>
                <SeasonBadges seasons={product.seasons} />
              </section>

              {/* SIZE */}
              <section>
                <p className="text-[0.65rem] tracking-[0.3em] text-navy/60 uppercase mb-3 font-medium">
                  Choose Size
                </p>
                <SizeSelector sizes={product.sizes} selected={size} onSelect={setSize} />
              </section>

              {/* STOCK */}
              <section className="rounded-2xl bg-card p-5 shadow-soft border border-border/60">
                <StockBar stock={product.stock} />
              </section>

              {/* BUY */}
              <section className="rounded-2xl bg-navy text-beige p-6 shadow-luxe">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase text-beige/60">
                      Total - {size.size}
                    </p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="font-display text-5xl text-beige">Rs. {size.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-beige/50 line-through">
                          Rs. {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    aria-label="Wishlist"
                    className="p-3 rounded-full border border-beige/30 hover:bg-beige/10 transition"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={onAddToCart}
                    disabled={product.stock <= 0}
                    className="!bg-beige !text-navy hover:!opacity-90"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onViewCart}
                    disabled={product.stock <= 0}
                    className="!border-beige !text-beige hover:!bg-beige hover:!text-navy"
                  >
                    View Cart
                  </Button>
                </div>
                <Button
                  onClick={() => handleBuyNow(product)}
                  disabled={product.stock <= 0}
                  className="mt-3 w-full !rounded-full !bg-gold px-6 py-3 !font-semibold !tracking-[0.26em] !text-navy hover:!opacity-95"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" /> Buy It Now
                </Button>
                <div className="mt-4 flex items-center gap-2 text-sm text-beige/70" aria-live="polite">
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
                      customers are viewing this product
                    </motion.span>
                  </AnimatePresence>
                </div>
              </section>
            </motion.div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
