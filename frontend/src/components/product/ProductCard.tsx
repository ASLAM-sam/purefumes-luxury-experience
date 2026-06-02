import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import type { Product } from "@/data/products";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";
import {
  PRODUCT_CARD_IMAGE_TRANSFORM,
  getCloudinaryImageUrl,
  getCloudinarySrcSet,
} from "@/lib/cloudinary-images";
import { formatINR } from "@/lib/money";

type ProductCardProps = {
  product: Product;
  showSize?: boolean;
  variant?: "default" | "bestseller";
  imageLoading?: "eager" | "lazy";
  imageFetchPriority?: "high" | "low" | "auto";
};

const getValidImageUrl = (product: Product) => {
  const getFirstImage = (images: unknown) => {
    if (Array.isArray(images)) {
      return images[0] || "";
    }

    if (typeof images === "string" && images.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(images) as unknown;
        return Array.isArray(parsed) ? parsed[0] || "" : "";
      } catch {
        return "";
      }
    }

    return "";
  };

  const normalizeImageSource = (image: unknown) => {
    if (typeof image === "string") {
      const trimmed = image.trim();

      if (!trimmed || trimmed.startsWith("[") || trimmed.includes(",")) {
        return "";
      }

      return trimmed;
    }

    if (image && typeof image === "object" && "url" in image) {
      return normalizeImageSource((image as { url?: unknown }).url);
    }

    return "";
  };

  const firstImage = getFirstImage((product as { images?: unknown }).images);
  const candidates = [product.image, firstImage].map(normalizeImageSource);
  return candidates.find((url) => typeof url === "string" && url.trim())?.trim() || "";
};

export const ProductCard = memo(function ProductCard({
  product,
  showSize = false,
  variant = "default",
  imageLoading = "lazy",
  imageFetchPriority = "auto",
}: ProductCardProps) {
  const { addToCart } = useApp();
  const { addNotification } = useNotification();
  const startPrice = product.sizes[0]?.price ?? product.price ?? 0;
  const originalPrice = Number(product.originalPrice || 0);
  const hasDiscount = originalPrice > startPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - startPrice) / originalPrice) * 100)
    : 0;
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviewCount ?? product.reviewsCount ?? 0);

  const featuredSize =
    product.sizes.find((size) => {
      const normalizedSize = String(size.size || "").trim().toLowerCase();
      return normalizedSize && normalizedSize !== "standard";
    })?.size || "";

  const isBestsellerCard = variant === "bestseller";
  const imageSrc = getValidImageUrl(product);
  const optimizedImageSrc = getCloudinaryImageUrl(imageSrc, PRODUCT_CARD_IMAGE_TRANSFORM);
  const optimizedImageSrcSet = getCloudinarySrcSet(imageSrc, [320, 480, 640]);
  const inStock = Number(product.stock || 0) > 0;
  const selectedSize = product.sizes[0] || { size: "Standard", price: startPrice };

  const quickAdd = () => {
    if (!inStock) return;
    addToCart(product, selectedSize);
    addNotification("Added to cart.");
  };

  return (
    <motion.article
      className={`product-card group/card relative flex h-full w-full flex-col overflow-hidden rounded-none bg-[#fffaf4] transition-all duration-300 ease-in-out ${
        isBestsellerCard
          ? "border border-border/70 shadow-soft hover:border-gold/40 hover:shadow-[0_18px_44px_rgba(91,58,41,0.12)]"
          : "border border-border/70 shadow-soft hover:border-gold/40 hover:shadow-[0_18px_44px_rgba(91,58,41,0.12)]"
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
          <div className="product-card-media product-fit-frame relative aspect-[4/5] overflow-hidden bg-[#f1e8dc]">
            <OptimizedImage
              src={optimizedImageSrc}
              srcSet={optimizedImageSrcSet}
              alt={product.name}
              width={900}
              height={900}
              loading={imageLoading}
              fetchPriority={imageFetchPriority}
              revealImmediately={imageLoading === "eager" || imageFetchPriority === "high"}
              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 45vw, 25vw"
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-[#efe7dc] font-display text-5xl text-[#5b3a29]/35">
                  {product.name.trim().charAt(0).toUpperCase() || "P"}
                </div>
              }
              className="product-fit-image product-card-image transition duration-500 ease-out"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b18]/18 via-transparent to-transparent opacity-80" />

            {discountPercentage > 0 ? (
              <span className="absolute left-3 top-3 bg-[#7b5136] px-2.5 py-1 text-[clamp(0.56rem,0.12vw+0.54rem,0.66rem)] uppercase tracking-[0.12em] text-[#fffaf4]">
                {discountPercentage}% OFF
              </span>
            ) : null}

            {isBestsellerCard || product.isBestseller ? (
              <span className="absolute right-3 top-3 bg-[#efd4a9] px-2.5 py-1 text-[clamp(0.56rem,0.12vw+0.54rem,0.66rem)] uppercase tracking-[0.14em] text-[#5b3a29]">
                Best Seller
              </span>
            ) : null}

            {!inStock ? (
              <span className="absolute bottom-3 left-3 border border-gold/40 bg-white/90 px-3 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-[#5b3a29] shadow-[0_12px_24px_rgba(91,58,41,0.14)] backdrop-blur md:text-[0.65rem]">
                Sold Out
              </span>
            ) : null}
          </div>
        </Link>

        <div className="product-card-actions absolute bottom-2 right-2 z-10 flex items-center gap-2 md:bottom-3 md:right-3">
          <WishlistButton
            product={product}
            className="h-8 w-8 border-[#5b3a29]/10 bg-[#fffaf4]/95 text-[#5b3a29] shadow-[0_10px_22px_rgba(91,58,41,0.14)] hover:border-[#c89b63] hover:text-[#c89b63] [&_svg]:h-3.5 [&_svg]:w-3.5 md:h-10 md:w-10 md:[&_svg]:h-4 md:[&_svg]:w-4"
          />
          <button
            type="button"
            onClick={quickAdd}
            disabled={!inStock}
            className="touch-target hidden h-10 w-10 items-center justify-center rounded-full border border-[#5b3a29]/15 bg-[#fffaf4]/95 text-[#5b3a29] shadow-soft backdrop-blur transition hover:border-[#c89b63] hover:text-[#c89b63] disabled:cursor-not-allowed disabled:opacity-50 md:flex"
            aria-label="Quick add to cart"
            title="Quick add"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="product-card-body flex flex-1 flex-col px-3 pb-4 pt-3 text-center md:px-4 md:pb-5 md:pt-4">
        <Link to="/product/$id" params={{ id: product.id }} className="block flex-1">
          <p className="product-card-brand truncate text-[clamp(0.58rem,0.12vw+0.56rem,0.68rem)] uppercase tracking-[0.28em] text-[#8b6b56]">
            {product.brand}
          </p>

          <h3 className="product-title mt-2 min-h-[2.9rem] text-[clamp(0.9rem,0.22vw+0.86rem,1.02rem)] font-medium leading-snug text-[#5b3a29] md:min-h-[3rem]">
            {product.name}
          </h3>

          {rating > 0 ? (
            <div className="product-card-rating mt-2 flex items-center justify-center gap-1 text-[0.72rem] text-[#8b6b56]">
              <Star className="h-3.5 w-3.5 fill-[#c89b63] text-[#c89b63]" />
              <span>{rating.toFixed(1)}</span>
              {reviewCount > 0 ? <span>- {reviewCount} reviews</span> : null}
            </div>
          ) : null}

          <div className="product-price mt-2 flex items-center justify-center gap-2 text-[clamp(0.88rem,0.18vw+0.84rem,1rem)] text-[#5b3a29]">
            {hasDiscount ? (
              <span className="text-xs text-[#8b6b56]/70 line-through">
                {formatINR(originalPrice)}
              </span>
            ) : null}
            <span className="font-medium">{formatINR(startPrice)}</span>
          </div>

          {showSize && featuredSize && (
            <p className="product-card-size mt-2 text-[clamp(0.58rem,0.12vw+0.56rem,0.68rem)] uppercase tracking-[0.2em] text-[#8b6b56]/75">
              Size {featuredSize}
            </p>
          )}
        </Link>

        <button
          type="button"
          onClick={quickAdd}
          disabled={!inStock}
          className="add-to-cart-btn mt-4 hidden min-h-10 items-center justify-center gap-2 border border-[#5b3a29]/15 bg-[#5b3a29] px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#fffaf4] transition hover:bg-[#c89b63] hover:text-[#1e1b18] disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Quick Add
        </button>
      </div>
    </motion.article>
  );
});
