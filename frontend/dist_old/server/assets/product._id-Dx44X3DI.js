import { r as reactExports, j as jsxRuntimeExports, O as ArrowRight, a0 as Sparkles, a1 as Flower2, a2 as TreePine, a3 as Expand, a4 as ChevronLeft, a5 as ChevronRight, B as BadgeCheck, T as Truck, a6 as Eye, q as ShoppingBag } from "./vendor-react-98xxEzFV.js";
import { L as Link, f as useNavigate } from "./vendor-tanstack-DkD25YnA.js";
import { O as OptimizedImage, K as cn, f as formatINR, B as Button, R as Route, u as useApp, a as useNotification, S as SiteShell, C as Container, p as productsApi } from "./router-DvCKRw9U.js";
import { R as Root2, L as List, T as Trigger, C as Content } from "./vendor-radix-xsh1HthL.js";
import { D as Dialog, a as DialogContent } from "./dialog-BFHKLRA3.js";
import { g as getCloudinarySrcSet, a as PRODUCT_THUMBNAIL_IMAGE_TRANSFORM, b as getCloudinaryImageUrl, c as PRODUCT_DETAIL_IMAGE_TRANSFORM, d as PRODUCT_FULLSCREEN_IMAGE_TRANSFORM, W as WishlistButton, P as ProductCard } from "./ProductCard-BH3E7mti.js";
import { A as AnimatePresence, m as motion } from "./vendor-motion-3kNaalGV.js";
import { b as saveBuyNowCheckoutState } from "./buy-now-Dvp3HSMB.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-charts-Ot63D9Dz.js";
const formatBrandCategory = (value) => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
const BrandBlock = reactExports.memo(function BrandBlock2({ product }) {
  const brandLogo = product.brandDetails?.logo || "";
  const brandCategory = product.brandDetails?.category ? formatBrandCategory(product.brandDetails.category) : "";
  const fallbackLetter = product.brandDetails?.fallbackLetter || product.brand.charAt(0).toUpperCase() || "B";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 md:flex-row md:items-center md:justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "brand-logo-frame h-20 w-20 shrink-0 bg-beige shadow-soft ring-1 ring-border sm:h-24 sm:w-24", children: brandLogo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        OptimizedImage,
        {
          src: brandLogo,
          alt: product.brand,
          width: 112,
          height: 112,
          sizes: "6rem",
          wrapperClassName: "flex h-full w-full items-center justify-center",
          className: "brand-logo-image"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-3xl text-navy sm:text-4xl", children: fallbackLetter }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.34em] text-gold", children: "Brand House" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl text-navy sm:text-4xl", children: product.brand }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-navy/65", children: "Discover the rest of this house and compare how its DNA unfolds across different perfumes, sizes, and occasions." }),
        brandCategory ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[0.68rem] uppercase tracking-[0.24em] text-navy/50", children: brandCategory }) : null
      ] })
    ] }),
    product.brandId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/brand/$brandId",
        params: { brandId: product.brandId },
        className: "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-xs uppercase tracking-[0.28em] text-beige shadow-soft transition hover:opacity-90",
        children: [
          "View all from this brand",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
        ]
      }
    ) : null
  ] }) });
});
const cols = [
  { key: "top", label: "Top Notes", Icon: Sparkles, color: "#F4C53D" },
  { key: "middle", label: "Heart Notes", Icon: Flower2, color: "#E89BB1" },
  { key: "base", label: "Base Notes", Icon: TreePine, color: "#8B5A2B" }
];
const NotesGrid = reactExports.memo(function NotesGrid2({ top, middle, base }) {
  const data = { top, middle, base };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: cols.map(({ key, label, Icon, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-beige/50 p-5 shadow-soft", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex h-8 w-8 items-center justify-center rounded-full",
          style: { backgroundColor: color + "33" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", style: { color } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.25em] text-navy/70 font-medium", children: label })
    ] }),
    data[key].length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: data[key].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-navy/85", children: n }, n)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/45", children: "Not listed yet" })
  ] }, key)) });
});
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
const ProductDetailTabs = reactExports.memo(function ProductDetailTabs2({ product }) {
  const hasNotes = product.topNotes.length > 0 || product.middleNotes.length > 0 || product.baseNotes.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft sm:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.34em] text-gold", children: "Product Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl text-navy sm:text-4xl", children: "Everything about this fragrance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xl text-sm leading-7 text-navy/60", children: "Explore the story, the structure, and the ideal wearing moments before you commit." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "description", className: "mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-auto w-full flex-wrap justify-start gap-2 rounded-[1.5rem] bg-beige/70 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "description",
            className: "rounded-full px-5 py-2 text-xs uppercase tracking-[0.24em] data-[state=active]:bg-navy data-[state=active]:text-beige",
            children: "Description"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "notes",
            className: "rounded-full px-5 py-2 text-xs uppercase tracking-[0.24em] data-[state=active]:bg-navy data-[state=active]:text-beige",
            children: "Notes"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "description", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.75rem] border border-border/60 bg-background/70 p-6 shadow-soft sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-8 text-navy/72 sm:text-base", children: product.description || "This fragrance arrives with a polished, versatile profile crafted for daily wear and memorable occasions alike." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.5rem] border border-border/60 bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.24em] text-navy/50", children: "About this fragrance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm text-navy/70", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-gold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Category:" }),
                " ",
                product.category
              ] })
            ] }),
            product.type ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm text-navy/70", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-gold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-navy", children: "Type:" }),
                " ",
                product.type
              ] })
            ] }) : null
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "notes", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 rounded-[1.75rem] border border-border/60 bg-background/70 p-6 shadow-soft sm:p-8", children: hasNotes ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        NotesGrid,
        {
          top: product.topNotes,
          middle: product.middleNotes,
          base: product.baseNotes
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.5rem] border border-dashed border-border/70 bg-card/60 px-5 py-10 text-center text-sm text-navy/50", children: "Detailed note information has not been added for this fragrance yet." }) }) })
    ] })
  ] });
});
const SWIPE_THRESHOLD_PX = 40;
const cleanImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map((image) => String(image || "").trim()).filter(Boolean);
  }
  const trimmed = String(images).trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((image) => String(image || "").trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
  return trimmed.split(",").map((image) => String(image || "").trim()).filter(Boolean);
};
const buildGalleryFrames = (images = []) => {
  const uniqueImages = Array.from(new Set(cleanImages(images)));
  const mediaItems = uniqueImages.map((url) => ({ url }));
  if (mediaItems.length === 0) {
    return { thumbnails: [], frames: [] };
  }
  if (mediaItems.length === 1) {
    return {
      thumbnails: mediaItems,
      frames: [mediaItems[0], mediaItems[0], mediaItems[0]]
    };
  }
  if (mediaItems.length === 2) {
    return {
      thumbnails: mediaItems,
      frames: [mediaItems[0], mediaItems[1], mediaItems[0]]
    };
  }
  return {
    thumbnails: mediaItems,
    frames: mediaItems
  };
};
const findFirstFrameIndex = (frames, media) => {
  const nextIndex = frames.findIndex((frame) => frame.url === media.url);
  return nextIndex >= 0 ? nextIndex : 0;
};
const ProductImageGallery = reactExports.memo(function ProductImageGallery2({
  productName,
  images,
  discountPercentage = 0
}) {
  const { thumbnails, frames } = reactExports.useMemo(() => buildGalleryFrames(images), [images]);
  const hasMedia = frames.length > 0;
  const [activeIndex, setActiveIndex] = reactExports.useState(0);
  const [zoomed, setZoomed] = reactExports.useState(false);
  const [zoomOrigin, setZoomOrigin] = reactExports.useState("50% 50%");
  const [fullscreenOpen, setFullscreenOpen] = reactExports.useState(false);
  const touchStartXRef = reactExports.useRef(null);
  const swipedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    setActiveIndex(0);
    setZoomed(false);
    setZoomOrigin("50% 50%");
  }, [frames]);
  const activeMedia = hasMedia ? frames[activeIndex] || frames[0] : { url: "" };
  const showControls = thumbnails.length > 1;
  const goToIndex = reactExports.useCallback(
    (nextIndex) => {
      if (!frames.length) return;
      const safeIndex = (nextIndex + frames.length) % frames.length;
      setActiveIndex(safeIndex);
    },
    [frames.length]
  );
  const goPrevious = reactExports.useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);
  const goNext = reactExports.useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);
  const selectThumbnail = reactExports.useCallback(
    (media) => {
      goToIndex(findFirstFrameIndex(frames, media));
    },
    [frames, goToIndex]
  );
  const updateZoomOrigin = reactExports.useCallback((event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * 100;
    const y = (event.clientY - bounds.top) / bounds.height * 100;
    setZoomOrigin(`${Math.min(Math.max(x, 0), 100)}% ${Math.min(Math.max(y, 0), 100)}%`);
  }, []);
  const handleTouchStart = reactExports.useCallback((event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    swipedRef.current = false;
  }, []);
  const handleTouchEnd = reactExports.useCallback(
    (event) => {
      const startX = touchStartXRef.current;
      const endX = event.changedTouches[0]?.clientX ?? null;
      touchStartXRef.current = null;
      if (startX === null || endX === null) {
        return;
      }
      const delta = endX - startX;
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
        return;
      }
      swipedRef.current = true;
      if (delta < 0) {
        goNext();
      } else {
        goPrevious();
      }
    },
    [goNext, goPrevious]
  );
  const openFullscreen = reactExports.useCallback(() => {
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    setFullscreenOpen(true);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid w-full max-w-[42rem] gap-3 sm:gap-4 xl:max-w-none xl:grid-cols-[4.5rem_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-2 xl:order-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible no-scrollbar", children: thumbnails.length ? thumbnails.map((media, index) => {
        const selected = activeMedia.url === media.url;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => selectThumbnail(media),
            className: cn(
              "group relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-card p-1 shadow-soft transition duration-300 sm:h-20 sm:w-20 xl:h-[4.5rem] xl:w-[4.5rem]",
              selected ? "border-navy ring-2 ring-navy/10" : "border-border/60 hover:-translate-y-0.5 hover:border-gold/60"
            ),
            "aria-label": `View image ${index + 1}`,
            "aria-pressed": selected,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                OptimizedImage,
                {
                  src: getCloudinaryImageUrl(media.url, PRODUCT_THUMBNAIL_IMAGE_TRANSFORM),
                  srcSet: getCloudinarySrcSet(
                    media.url,
                    [120, 160, 240],
                    PRODUCT_THUMBNAIL_IMAGE_TRANSFORM
                  ),
                  alt: `${productName} thumbnail ${index + 1}`,
                  width: 160,
                  height: 160,
                  sizes: "5rem",
                  className: "h-full w-full rounded-[1rem] object-contain object-center p-1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "absolute inset-x-3 bottom-2 h-0.5 rounded-full transition",
                    selected ? "bg-gold" : "bg-transparent"
                  )
                }
              )
            ]
          },
          `${media.url}-${index}`
        );
      }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-beige/70 text-center text-[0.55rem] uppercase tracking-[0.16em] text-navy/40 sm:h-20 sm:w-20 sm:text-[0.65rem] sm:tracking-[0.24em]", children: "Gallery unavailable" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-1 xl:order-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.5rem] border border-border/60 bg-card p-3 shadow-luxe sm:rounded-[2rem] sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-beige/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: openFullscreen,
            onMouseEnter: () => setZoomed(true),
            onMouseLeave: () => setZoomed(false),
            onMouseMove: updateZoomOrigin,
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
            className: "group product-fit-frame relative flex aspect-square w-full items-center justify-center overflow-hidden p-2 text-left sm:p-4",
            "aria-label": "Open product image preview",
            children: [
              hasMedia && activeMedia.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                OptimizedImage,
                {
                  src: getCloudinaryImageUrl(activeMedia.url, PRODUCT_DETAIL_IMAGE_TRANSFORM),
                  srcSet: getCloudinarySrcSet(
                    activeMedia.url,
                    [640, 1e3],
                    PRODUCT_DETAIL_IMAGE_TRANSFORM
                  ),
                  alt: productName,
                  width: 1100,
                  height: 1100,
                  sizes: "(max-width: 768px) 92vw, 55vw",
                  className: cn(
                    "h-full w-full object-contain object-center p-1 transition duration-300 ease-out sm:p-2",
                    zoomed ? "scale-[1.04]" : "scale-100"
                  ),
                  style: zoomed ? { transformOrigin: zoomOrigin } : void 0
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center rounded-[1.5rem] bg-beige/80 text-sm uppercase tracking-[0.3em] text-navy/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-3.5 w-3.5 rounded-full bg-navy/20" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy/10 via-transparent to-transparent" }),
              discountPercentage > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-4 top-4 rounded-full bg-navy px-4 py-2 text-[0.65rem] uppercase tracking-[0.26em] text-beige shadow-soft", children: [
                discountPercentage,
                "% off"
              ] }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy shadow-soft backdrop-blur", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Expand, { className: "h-3.5 w-3.5" }),
                "Preview"
              ] })
            ]
          }
        ),
        showControls ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: goPrevious,
              className: "absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-navy shadow-soft transition hover:scale-105 hover:bg-white",
              "aria-label": "Previous image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: goNext,
              className: "absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-navy shadow-soft transition hover:scale-105 hover:bg-white",
              "aria-label": "Next image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 right-4 rounded-full bg-navy/90 px-3 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-beige shadow-soft", children: [
          Math.min(activeIndex + 1, thumbnails.length),
          " / ",
          thumbnails.length
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: fullscreenOpen, onOpenChange: setFullscreenOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "left-0 top-0 h-[100dvh] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-[#071c36]/98 p-4 text-beige shadow-none sm:p-6 [&>button]:right-4 [&>button]:top-4 [&>button]:text-beige [&>button]:opacity-100 [&>button]:hover:bg-white/10 [&>button]:hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col gap-4 pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pr-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[0.65rem] uppercase tracking-[0.32em] text-beige/60", children: [
          "Media ",
          Math.min(activeIndex + 1, thumbnails.length),
          " of ",
          thumbnails.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl text-beige sm:text-4xl", children: productName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-0 flex-1 items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-8", children: hasMedia && activeMedia.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          OptimizedImage,
          {
            src: getCloudinaryImageUrl(activeMedia.url, PRODUCT_FULLSCREEN_IMAGE_TRANSFORM),
            srcSet: getCloudinarySrcSet(
              activeMedia.url,
              [1e3, 1400],
              PRODUCT_FULLSCREEN_IMAGE_TRANSFORM
            ),
            alt: productName,
            width: 1400,
            height: 1400,
            sizes: "92vw",
            className: "h-full w-full object-contain"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center rounded-[1.5rem] bg-white/5 text-[0.8rem] uppercase tracking-[0.24em] text-beige/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-3.5 w-3.5 rounded-full bg-beige/40" }) }) }),
        showControls ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: goPrevious,
              className: "absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-beige shadow-soft transition hover:bg-white/20 sm:left-4",
              "aria-label": "Previous fullscreen image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: goNext,
              className: "absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-beige shadow-soft transition hover:bg-white/20 sm:right-4",
              "aria-label": "Next fullscreen image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
            }
          )
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-1 no-scrollbar", children: thumbnails.length ? thumbnails.map((media, index) => {
        const selected = activeMedia.url === media.url;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => selectThumbnail(media),
            className: cn(
              "h-20 w-20 shrink-0 overflow-hidden rounded-2xl border p-1 transition duration-300",
              selected ? "border-gold bg-white/10" : "border-white/10 bg-white/5 hover:border-white/25"
            ),
            "aria-label": `Fullscreen image ${index + 1}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              OptimizedImage,
              {
                src: getCloudinaryImageUrl(media.url, PRODUCT_THUMBNAIL_IMAGE_TRANSFORM),
                srcSet: getCloudinarySrcSet(
                  media.url,
                  [120, 160, 240],
                  PRODUCT_THUMBNAIL_IMAGE_TRANSFORM
                ),
                alt: `${productName} fullscreen thumbnail ${index + 1}`,
                width: 160,
                height: 160,
                sizes: "5rem",
                className: "h-full w-full rounded-[1rem] object-contain object-center"
              }
            )
          },
          `fullscreen-${media.url}-${index}`
        );
      }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[0.65rem] uppercase tracking-[0.24em] text-beige/60", children: "Gallery unavailable" }) })
    ] }) }) })
  ] });
});
const SizeSelector = reactExports.memo(function SizeSelector2({ sizes, selected, onSelect }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 min-[420px]:gap-3 lg:grid-cols-3", children: sizes.map((s) => {
    const active = s.size === selected.size;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onSelect(s),
        "aria-pressed": active,
        className: `min-w-0 rounded-2xl border p-3 text-left transition-all min-[420px]:p-4 ${active ? "border-navy bg-navy text-beige shadow-luxe" : "border-border/70 bg-card text-navy/75 hover:-translate-y-0.5 hover:border-navy/40 hover:bg-beige/30"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-wrap items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words font-display text-lg leading-tight min-[420px]:text-xl sm:text-2xl", children: s.size }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-1 text-[0.65rem] uppercase tracking-[0.12em] min-[420px]:text-xs min-[420px]:tracking-[0.2em] ${active ? "text-beige/70" : "text-navy/45"}`, children: formatINR(s.price) })
          ] }),
          active ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-beige/10 px-2 py-1 text-[0.52rem] uppercase tracking-[0.12em] text-beige/80 min-[420px]:px-2.5 min-[420px]:text-[0.58rem] min-[420px]:tracking-[0.18em]", children: "Selected" }) : null
        ] })
      },
      s.size
    );
  }) });
});
function PurchaseButtons({
  disabled,
  compact = false,
  onAddToCart,
  onBuyNow
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: compact ? "grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 min-[380px]:gap-3" : "grid gap-3 sm:grid-cols-2",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: onAddToCart,
            disabled,
            className: compact ? "add-to-cart-btn min-h-[48px] min-w-0 px-2 py-3 text-[0.66rem] font-semibold tracking-[0.08em] min-[380px]:min-h-[52px] min-[380px]:px-4 min-[380px]:text-[0.72rem] min-[380px]:tracking-[0.14em]" : "add-to-cart-btn min-h-[52px] px-4 py-3 text-sm font-semibold sm:min-h-[52px] sm:px-8 sm:py-4 !bg-beige !text-navy hover:!opacity-90",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
              " Add to Cart"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "gold",
            onClick: onBuyNow,
            disabled,
            className: compact ? "quick-shop-btn buy-now-jiggle min-h-[48px] min-w-0 px-2 py-3 text-[0.68rem] font-semibold tracking-[0.08em] min-[380px]:min-h-[52px] min-[380px]:px-4 min-[380px]:text-[0.78rem] min-[380px]:tracking-[0.14em]" : "quick-shop-btn buy-now-jiggle min-h-[56px] px-6 py-4 text-[15px] font-semibold sm:min-h-[52px] sm:px-8 sm:py-4 sm:text-sm flex sm:block",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
              " Buy Now"
            ]
          }
        )
      ]
    }
  );
}
const ProductInfo = reactExports.memo(function ProductInfo2({
  product,
  selectedSize,
  onSelectSize,
  onAddToCart,
  onBuyNow,
  viewers
}) {
  const inStock = product.stock > 0;
  const viewerCount = viewers ?? 1;
  const viewersReady = viewers !== null;
  const savings = reactExports.useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= selectedSize.price) {
      return 0;
    }
    return Math.round((product.originalPrice - selectedSize.price) / product.originalPrice * 100);
  }, [product.originalPrice, selectedSize.price]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "lg:sticky lg:top-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft sm:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          product.brandId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/brand/$brandId",
              params: { brandId: product.brandId },
              className: "text-[0.65rem] uppercase tracking-[0.38em] text-gold transition hover:text-navy",
              children: product.brand
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.38em] text-gold", children: product.brand }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-border bg-beige/60 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-navy/60", children: product.category })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WishlistButton, { product, showLabel: true, variant: "inline", className: "self-start" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-3xl leading-[0.95] text-navy sm:text-5xl", children: product.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl text-sm leading-7 text-navy/68 sm:text-base", children: product.description || "A refined fragrance crafted to elevate your daily ritual." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-3", children: [
        !inStock ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy shadow-[0_10px_24px_rgba(201,161,74,0.12)]", children: "Sold Out" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-beige/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/70 ring-1 ring-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 text-gold" }),
          "Authentic decants"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-beige/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/70 ring-1 ring-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3.5 w-3.5 text-gold" }),
          "Fast dispatch"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 rounded-[1.75rem] bg-navy p-6 text-beige shadow-luxe", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.3em] text-beige/60", children: "Selected size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-end gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-4xl text-beige sm:text-5xl", children: formatINR(selectedSize.price) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-beige/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-beige/70", children: selectedSize.size }),
            product.originalPrice && product.originalPrice > selectedSize.price ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-beige/45 line-through", children: formatINR(product.originalPrice) }) : null
          ] })
        ] }),
        savings > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-full bg-gold px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy", children: [
          savings,
          "% OFF"
        ] }) : null
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.28em] text-navy/55", children: "Choose size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.14em] text-navy/45 sm:text-xs sm:tracking-[0.18em]", children: "Price updates instantly" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SizeSelector, { sizes: product.sizes, selected: selectedSize, onSelect: onSelectSize })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-[1.75rem] border border-border/60 bg-background/70 p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PurchaseButtons, { disabled: !inStock, onAddToCart, onBuyNow }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 text-sm text-navy/60", "aria-live": "polite", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 text-gold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", initial: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.span,
            {
              initial: { opacity: 0, y: 4 },
              animate: { opacity: viewersReady ? 1 : 0, y: 0 },
              exit: { opacity: 0, y: -4 },
              transition: { duration: 0.22, ease: "easeOut" },
              className: "inline-flex min-h-6 items-center gap-1",
              "aria-hidden": !viewersReady,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gold", children: viewerCount }),
                "shoppers are viewing this fragrance"
              ]
            },
            viewersReady ? viewerCount : "pending-viewers"
          ) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-[var(--mobile-bottom-nav-height)] z-40 border-t border-border/70 bg-background/95 p-3 shadow-[0_-16px_35px_-24px_rgba(7,32,63,0.55)] backdrop-blur lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-3 py-3 shadow-soft min-[380px]:px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.58rem] uppercase tracking-[0.24em] text-navy/45", children: selectedSize.size }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-display text-xl text-navy min-[380px]:text-2xl", children: formatINR(selectedSize.price) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `shrink-0 rounded-full px-2.5 py-1 text-[0.54rem] uppercase tracking-[0.14em] min-[380px]:px-3 min-[380px]:text-[0.58rem] min-[380px]:tracking-[0.22em] ${inStock ? "bg-beige/70 text-navy/70 ring-1 ring-border/60" : "border border-gold/35 bg-gold/10 text-navy"}`,
            children: inStock ? "Ready to order" : "Sold Out"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PurchaseButtons,
        {
          disabled: !inStock,
          compact: true,
          onAddToCart,
          onBuyNow
        }
      )
    ] }) })
  ] });
});
const RelatedProducts = reactExports.memo(function RelatedProducts2({
  products,
  loading,
  error,
  brandName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "related-products mx-auto max-w-[1200px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.65rem] uppercase tracking-[0.34em] text-gold", children: "Related Products" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-2 font-display text-3xl text-navy sm:text-4xl", children: [
        "More from ",
        brandName
      ] })
    ] }) }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700", children: error }) : null,
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "related-grid product-grid mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4", children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "min-w-0",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-xl bg-[#f1ece6]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-24 rounded bg-[#eee7de]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-40 rounded bg-[#eee7de]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-28 rounded bg-[#eee7de]" })
        ] })
      },
      index
    )) }) : null,
    !loading && !error && products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-[1.75rem] border border-dashed border-border/70 bg-card/60 px-5 py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl text-navy", children: "No related products yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm leading-6 text-navy/55", children: [
        "More fragrances from ",
        brandName,
        " will appear here automatically."
      ] })
    ] }) : null,
    !loading && !error && products.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "related-grid product-grid mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4", children: products.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "min-w-0",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product })
      },
      product.id
    )) }) : null
  ] });
});
const MIN_VIEWERS = 1;
const MAX_VIEWERS = 10;
const getRandomViewerCount = () => Math.floor(Math.random() * (MAX_VIEWERS - MIN_VIEWERS + 1)) + MIN_VIEWERS;
const getRandomViewerDelay = () => Math.floor(Math.random() * 7001) + 8e3;
const clampViewerCount = (value) => Math.min(MAX_VIEWERS, Math.max(MIN_VIEWERS, value));
const getNearbyViewerCount = (current) => {
  const deltas = [-2, -1, -1, 1, 1, 2];
  const delta = deltas[Math.floor(Math.random() * deltas.length)] || 1;
  const next = clampViewerCount(current + delta);
  if (next !== current) {
    return next;
  }
  return current === MIN_VIEWERS ? current + 1 : current - 1;
};
function ProductPage() {
  const {
    product
  } = Route.useLoaderData();
  const {
    addToCart
  } = useApp();
  const {
    addNotification
  } = useNotification();
  const nav = useNavigate();
  const [size, setSize] = reactExports.useState(product.sizes[0]);
  const [viewers, setViewers] = reactExports.useState(null);
  const [relatedProducts, setRelatedProducts] = reactExports.useState([]);
  const [relatedLoading, setRelatedLoading] = reactExports.useState(true);
  const [relatedError, setRelatedError] = reactExports.useState("");
  const galleryImages = reactExports.useMemo(() => product.images?.length ? product.images : product.image ? [product.image] : [], [product.image, product.images]);
  reactExports.useEffect(() => {
    setSize(product.sizes[0]);
  }, [product]);
  reactExports.useEffect(() => {
    let timeoutId;
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
      if (timeoutId !== void 0) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [product.id]);
  reactExports.useEffect(() => {
    let isActive = true;
    const loadRelatedProducts = async () => {
      setRelatedLoading(true);
      setRelatedError("");
      try {
        const brandProducts = await productsApi.list(product.brandId ? {
          brandId: product.brandId,
          page: 1,
          limit: 8
        } : {
          brand: product.brand,
          page: 1,
          limit: 8
        });
        const nextProducts = brandProducts.filter((item) => item.id !== product.id).length >= 4 ? brandProducts : await productsApi.list({
          category: product.category,
          page: 1,
          limit: 8
        });
        if (!isActive) return;
        setRelatedProducts(nextProducts.filter((item) => item.id !== product.id).slice(0, 8));
      } catch (error) {
        if (!isActive) return;
        setRelatedProducts([]);
        setRelatedError(error instanceof Error ? error.message : "Related products could not be loaded.");
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
  const onAddToCart = reactExports.useCallback(() => {
    addToCart(product, size);
    addNotification("Added to cart.");
  }, [addNotification, addToCart, product, size]);
  const handleBuyNow = reactExports.useCallback(() => {
    saveBuyNowCheckoutState({
      buyNowProduct: product,
      buyNowSize: size
    });
    nav({
      to: "/checkout"
    });
  }, [nav, product, size]);
  const baseGalleryPrice = product.sizes[0]?.price ?? product.price ?? 0;
  const galleryDiscount = product.originalPrice && product.originalPrice > baseGalleryPrice ? Math.round((product.originalPrice - baseGalleryPrice) / product.originalPrice * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SiteShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "pb-56 pt-10 sm:pt-12 lg:pb-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/category/$slug", params: {
      slug: product.category.toLowerCase().replace(" ", "-")
    }, className: "inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-navy/60 hover:text-navy", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
      " Back to ",
      product.category
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(22rem,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProductImageGallery, { productName: product.name, images: galleryImages, discountPercentage: galleryDiscount }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProductInfo, { product, selectedSize: size, onSelectSize: setSize, onAddToCart, onBuyNow: handleBuyNow, viewers })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandBlock, { product }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductDetailTabs, { product }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-14", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RelatedProducts, { products: relatedProducts, loading: relatedLoading, error: relatedError, brandName: product.brand }) })
  ] }) }) });
}
export {
  ProductPage as component
};
