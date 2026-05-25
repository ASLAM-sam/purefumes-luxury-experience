import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { BrandBlock } from "@/components/product/BrandBlock";
import { ProductDetailTabs } from "@/components/product/ProductDetailTabs";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductPageSkeleton } from "@/components/product/ProductPageSkeleton";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import type { Product } from "@/data/products";
import { saveBuyNowCheckoutState } from "@/lib/buy-now";
import { productsApi } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";

const MIN_VIEWERS = 1;
const MAX_VIEWERS = 10;

const getRandomViewerCount = () =>
  Math.floor(Math.random() * (MAX_VIEWERS - MIN_VIEWERS + 1)) + MIN_VIEWERS;

const getRandomViewerDelay = () => Math.floor(Math.random() * 7001) + 8000;

const clampViewerCount = (value: number) => Math.min(MAX_VIEWERS, Math.max(MIN_VIEWERS, value));

const getNearbyViewerCount = (current: number) => {
  const deltas = [-2, -1, -1, 1, 1, 2];
  const delta = deltas[Math.floor(Math.random() * deltas.length)] || 1;
  const next = clampViewerCount(current + delta);

  if (next !== current) {
    return next;
  }

  return current === MIN_VIEWERS ? current + 1 : current - 1;
};

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await productsApi.get(params.id);
    if (!product) throw notFound();
    return { product };
  },
  pendingComponent: ProductPending,
  component: ProductPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-40 text-center">
        <h1 className="font-display text-5xl text-navy">Product not found</h1>
        <Link to="/" className="mt-6 inline-block text-gold underline-slide">
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

function ProductPending() {
  return <ProductPageSkeleton />;
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart } = useApp();
  const { addNotification } = useNotification();
  const nav = useNavigate();
  const [size, setSize] = useState(product.sizes[0]);
  const [viewers, setViewers] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [relatedError, setRelatedError] = useState("");
  const galleryImages = useMemo(
    () => (product.images?.length ? product.images : product.image ? [product.image] : []),
    [product.image, product.images],
  );

  useEffect(() => {
    setSize(product.sizes[0]);
  }, [product]);

  useEffect(() => {
    let timeoutId: number | undefined;
    let latestViewerCount = getRandomViewerCount();

    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        setViewers((current) => {
          const nextViewerCount = getNearbyViewerCount(current ?? latestViewerCount);
          latestViewerCount = nextViewerCount;
          return nextViewerCount;
        });
        scheduleNext();
      }, getRandomViewerDelay());
    };

    setViewers(latestViewerCount);
    scheduleNext();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [product.id]);

  useEffect(() => {
    let isActive = true;

    const loadRelatedProducts = async () => {
      setRelatedLoading(true);
      setRelatedError("");

      try {
        const brandProducts = await productsApi.list(
          product.brandId
            ? { brandId: product.brandId, page: 1, limit: 8 }
            : { brand: product.brand, page: 1, limit: 8 },
        );
        const nextProducts =
          brandProducts.filter((item) => item.id !== product.id).length >= 4
            ? brandProducts
            : await productsApi.list({ category: product.category, page: 1, limit: 8 });

        if (!isActive) return;

        setRelatedProducts(nextProducts.filter((item) => item.id !== product.id).slice(0, 8));
      } catch (error) {
        if (!isActive) return;

        setRelatedProducts([]);
        setRelatedError(
          error instanceof Error ? error.message : "Related products could not be loaded.",
        );
      } finally {
        if (isActive) {
          setRelatedLoading(false);
        }
      }
    };

    loadRelatedProducts();

    return () => {
      isActive = false;
    };
  }, [product.brand, product.brandId, product.category, product.id]);

  const onAddToCart = useCallback(() => {
    addToCart(product, size);
    addNotification("Added to cart.");
  }, [addNotification, addToCart, product, size]);

  const handleBuyNow = useCallback(() => {
    saveBuyNowCheckoutState({
      buyNowProduct: product,
      buyNowSize: size,
    });
    nav({ to: "/checkout" });
  }, [nav, product, size]);

  const baseGalleryPrice = product.sizes[0]?.price ?? product.price ?? 0;
  const galleryDiscount =
    product.originalPrice && product.originalPrice > baseGalleryPrice
      ? Math.round(((product.originalPrice - baseGalleryPrice) / product.originalPrice) * 100)
      : 0;

  return (
    <SiteShell>
      <section className="pb-56 pt-10 sm:pt-12 lg:pb-16">
        <Container>
          <Link
            to="/category/$slug"
            params={{ slug: product.category.toLowerCase().replace(" ", "-") }}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-navy/60 hover:text-navy"
          >
            <ChevronLeft className="h-4 w-4" /> Back to {product.category}
          </Link>

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(22rem,1fr)]">
            <ProductImageGallery
              productName={product.name}
              images={galleryImages}
              discountPercentage={galleryDiscount}
            />

            <ProductInfo
              product={product}
              selectedSize={size}
              onSelectSize={setSize}
              onAddToCart={onAddToCart}
              onBuyNow={handleBuyNow}
              viewers={viewers}
            />
          </div>

          <div className="mt-10">
            <BrandBlock product={product} />
          </div>

          <div className="mt-10">
            <ProductDetailTabs product={product} />
          </div>

          <div className="mt-14">
            <RelatedProducts
              products={relatedProducts}
              loading={relatedLoading}
              error={relatedError}
              brandName={product.brand}
            />
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
