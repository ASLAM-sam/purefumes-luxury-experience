import { r as reactExports, j as jsxRuntimeExports, H as Heart, q as ShoppingBag, a7 as Star } from "./vendor-react-98xxEzFV.js";
import { L as Link } from "./vendor-tanstack-DkD25YnA.js";
import { a as useNotification, L as useWishlistStatus, K as cn, M as uiActionObserver, u as useApp, O as OptimizedImage, f as formatINR } from "./router-DvCKRw9U.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
const WishlistButton = reactExports.memo(function WishlistButton2({
  product,
  className,
  showLabel = false,
  variant = "floating"
}) {
  const { addNotification } = useNotification();
  const { active, pending } = useWishlistStatus(product.id);
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    const added = uiActionObserver.toggleWishlist(product);
    addNotification(
      added ? "Added to wishlist." : "Removed from wishlist.",
      added ? "success" : "info"
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: handleClick,
      disabled: pending,
      "aria-label": active ? "Remove from wishlist" : "Add to wishlist",
      "aria-pressed": active,
      "aria-busy": pending,
      className: cn(
        "inline-flex items-center justify-center gap-2 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        variant === "floating" ? "h-10 w-10 rounded-full border-white/70 bg-white/90 text-navy shadow-soft backdrop-blur hover:-translate-y-0.5 hover:border-gold/70 hover:text-gold" : "rounded-xl border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.22em] text-navy shadow-soft hover:border-gold/60 hover:text-gold",
        active ? "border-gold/70 text-gold" : "",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4", fill: active ? "currentColor" : "none" }),
        showLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: active ? "Wishlisted" : "Wishlist" }) : null
      ]
    }
  );
});
const CLOUDINARY_UPLOAD_SEGMENT = "upload";
const CLOUDINARY_TRANSFORM_PATTERN = /(^|,)(a|ar|b|c|co|dpr|e|f|fl|g|h|l|o|q|r|t|w|x|y|z)_/;
const PRODUCT_CARD_IMAGE_TRANSFORM = "f_auto,q_auto,w_480,c_limit";
const PRODUCT_DETAIL_IMAGE_TRANSFORM = "f_auto,q_auto,w_1000,c_limit";
const PRODUCT_THUMBNAIL_IMAGE_TRANSFORM = "f_auto,q_auto,w_160,c_limit";
const PRODUCT_FULLSCREEN_IMAGE_TRANSFORM = "f_auto,q_auto,w_1400,c_limit";
const isCloudinaryImageUrl = (url) => url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
const canTransformCloudinaryImage = (image = "") => {
  try {
    return isCloudinaryImageUrl(new URL(image));
  } catch (_error) {
    return false;
  }
};
const isVersionSegment = (segment = "") => /^v\d+$/.test(segment);
const isTransformSegment = (segment = "") => CLOUDINARY_TRANSFORM_PATTERN.test(segment);
const buildWidthTransform = (baseTransform, width) => baseTransform.replace(/(^|,)w_\d+(?=,|$)/, `$1w_${width}`);
const getCloudinaryImageUrl = (value, transform) => {
  const image = String(value || "").trim();
  if (!image || !transform) return image;
  try {
    const url = new URL(image);
    if (!isCloudinaryImageUrl(url)) return image;
    const segments = url.pathname.split("/");
    const uploadIndex = segments.indexOf(CLOUDINARY_UPLOAD_SEGMENT);
    if (uploadIndex < 0) return image;
    const nextIndex = uploadIndex + 1;
    const nextSegment = segments[nextIndex] || "";
    if (!nextSegment || isVersionSegment(nextSegment)) {
      segments.splice(nextIndex, 0, transform);
    } else if (isTransformSegment(nextSegment)) {
      segments[nextIndex] = transform;
    } else {
      segments.splice(nextIndex, 0, transform);
    }
    url.pathname = segments.join("/");
    return url.toString();
  } catch (_error) {
    return image;
  }
};
const getCloudinarySrcSet = (value, widths, baseTransform = PRODUCT_CARD_IMAGE_TRANSFORM) => {
  const image = String(value || "").trim();
  if (!image) return void 0;
  if (!canTransformCloudinaryImage(image)) return void 0;
  const sources = widths.filter((width) => Number.isFinite(width) && width > 0).map((width) => {
    const transform = buildWidthTransform(baseTransform, width);
    return `${getCloudinaryImageUrl(image, transform)} ${width}w`;
  });
  return sources.length ? sources.join(", ") : void 0;
};
const getValidImageUrl = (product) => {
  const getFirstImage = (images) => {
    if (Array.isArray(images)) {
      return images[0] || "";
    }
    if (typeof images === "string" && images.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed[0] || "" : "";
      } catch {
        return "";
      }
    }
    return "";
  };
  const normalizeImageSource = (image) => {
    if (typeof image === "string") {
      const trimmed = image.trim();
      if (!trimmed || trimmed.startsWith("[") || trimmed.includes(",")) {
        return "";
      }
      return trimmed;
    }
    if (image && typeof image === "object" && "url" in image) {
      return normalizeImageSource(image.url);
    }
    return "";
  };
  const firstImage = getFirstImage(product.images);
  const candidates = [product.image, firstImage].map(normalizeImageSource);
  return candidates.find((url) => typeof url === "string" && url.trim())?.trim() || "";
};
const ProductCard = reactExports.memo(function ProductCard2({
  product,
  showSize = false,
  variant = "default",
  imageLoading = "lazy",
  imageFetchPriority = "auto"
}) {
  const { addToCart } = useApp();
  const { addNotification } = useNotification();
  const startPrice = product.sizes[0]?.price ?? product.price ?? 0;
  const originalPrice = Number(product.originalPrice || 0);
  const hasDiscount = originalPrice > startPrice;
  const discountPercentage = hasDiscount ? Math.round((originalPrice - startPrice) / originalPrice * 100) : 0;
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviewCount ?? product.reviewsCount ?? 0);
  const featuredSize = product.sizes.find((size) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.article,
    {
      className: `product-card group/card relative flex h-full w-full flex-col overflow-hidden rounded-none bg-[#fffaf4] transition-all duration-300 ease-in-out ${isBestsellerCard ? "border border-border/70 shadow-soft hover:border-gold/40 hover:shadow-[0_18px_44px_rgba(91,58,41,0.12)]" : "border border-border/70 shadow-soft hover:border-gold/40 hover:shadow-[0_18px_44px_rgba(91,58,41,0.12)]"}`,
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      whileHover: {
        y: -5,
        scale: 1.01,
        transition: { duration: 0.2 }
      },
      viewport: { once: true },
      children: [
        isBestsellerCard && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent opacity-0 transition group-hover/card:opacity-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/product/$id", params: { id: product.id }, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-media product-fit-frame relative aspect-[4/5] overflow-hidden bg-[#f1e8dc]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              OptimizedImage,
              {
                src: optimizedImageSrc,
                srcSet: optimizedImageSrcSet,
                alt: product.name,
                width: 900,
                height: 900,
                loading: imageLoading,
                fetchPriority: imageFetchPriority,
                revealImmediately: imageLoading === "eager" || imageFetchPriority === "high",
                sizes: "(max-width: 640px) 48vw, (max-width: 1024px) 45vw, 25vw",
                fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center bg-[#efe7dc] font-display text-5xl text-[#5b3a29]/35", children: product.name.trim().charAt(0).toUpperCase() || "P" }),
                className: "product-fit-image product-card-image transition duration-500 ease-out"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#1e1b18]/18 via-transparent to-transparent opacity-80" }),
            discountPercentage > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute left-3 top-3 bg-[#7b5136] px-2.5 py-1 text-[clamp(0.56rem,0.12vw+0.54rem,0.66rem)] uppercase tracking-[0.12em] text-[#fffaf4]", children: [
              discountPercentage,
              "% OFF"
            ] }) : null,
            isBestsellerCard || product.isBestseller ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-3 bg-[#efd4a9] px-2.5 py-1 text-[clamp(0.56rem,0.12vw+0.54rem,0.66rem)] uppercase tracking-[0.14em] text-[#5b3a29]", children: "Best Seller" }) : null,
            !inStock ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-3 left-3 border border-gold/40 bg-white/90 px-3 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-[#5b3a29] shadow-[0_12px_24px_rgba(91,58,41,0.14)] backdrop-blur md:text-[0.65rem]", children: "Sold Out" }) : null
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-actions absolute bottom-2 right-2 z-10 flex items-center gap-2 md:bottom-3 md:right-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              WishlistButton,
              {
                product,
                className: "h-8 w-8 border-[#5b3a29]/10 bg-[#fffaf4]/95 text-[#5b3a29] shadow-[0_10px_22px_rgba(91,58,41,0.14)] hover:border-[#c89b63] hover:text-[#c89b63] [&_svg]:h-3.5 [&_svg]:w-3.5 md:h-10 md:w-10 md:[&_svg]:h-4 md:[&_svg]:w-4"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: quickAdd,
                disabled: !inStock,
                className: "touch-target hidden h-10 w-10 items-center justify-center rounded-full border border-[#5b3a29]/15 bg-[#fffaf4]/95 text-[#5b3a29] shadow-soft backdrop-blur transition hover:border-[#c89b63] hover:text-[#c89b63] disabled:cursor-not-allowed disabled:opacity-50 md:flex",
                "aria-label": "Quick add to cart",
                title: "Quick add",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-body flex flex-1 flex-col px-3 pb-4 pt-3 text-center md:px-4 md:pb-5 md:pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/product/$id", params: { id: product.id }, className: "block flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "product-card-brand truncate text-[clamp(0.58rem,0.12vw+0.56rem,0.68rem)] uppercase tracking-[0.28em] text-[#8b6b56]", children: product.brand }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "product-title mt-2 min-h-[2.9rem] text-[clamp(0.9rem,0.22vw+0.86rem,1.02rem)] font-medium leading-snug text-[#5b3a29] md:min-h-[3rem]", children: product.name }),
            rating > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-rating mt-2 flex items-center justify-center gap-1 text-[0.72rem] text-[#8b6b56]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 fill-[#c89b63] text-[#c89b63]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: rating.toFixed(1) }),
              reviewCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "- ",
                reviewCount,
                " reviews"
              ] }) : null
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-price mt-2 flex items-center justify-center gap-2 text-[clamp(0.88rem,0.18vw+0.84rem,1rem)] text-[#5b3a29]", children: [
              hasDiscount ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#8b6b56]/70 line-through", children: formatINR(originalPrice) }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatINR(startPrice) })
            ] }),
            showSize && featuredSize && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "product-card-size mt-2 text-[clamp(0.58rem,0.12vw+0.56rem,0.68rem)] uppercase tracking-[0.2em] text-[#8b6b56]/75", children: [
              "Size ",
              featuredSize
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: quickAdd,
              disabled: !inStock,
              className: "add-to-cart-btn mt-4 hidden min-h-10 items-center justify-center gap-2 border border-[#5b3a29]/15 bg-[#5b3a29] px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#fffaf4] transition hover:bg-[#c89b63] hover:text-[#1e1b18] disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-3.5 w-3.5" }),
                "Quick Add"
              ]
            }
          )
        ] })
      ]
    }
  );
});
export {
  ProductCard as P,
  WishlistButton as W,
  PRODUCT_THUMBNAIL_IMAGE_TRANSFORM as a,
  getCloudinaryImageUrl as b,
  PRODUCT_DETAIL_IMAGE_TRANSFORM as c,
  PRODUCT_FULLSCREEN_IMAGE_TRANSFORM as d,
  getCloudinarySrcSet as g
};
