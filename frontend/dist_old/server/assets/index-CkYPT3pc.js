import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { x as frontendEventBus, y as BANNERS_CHANGED_EVENT, z as DATA_EVENT_STORAGE_KEY, h as filterStorefrontCategories, d as categoriesApi, C as Container, j as CategoryRail, O as OptimizedImage, E as useRenderInstrumentation, F as BESTSELLERS_CHANGED_EVENT, k as Skeleton, p as productsApi, G as storefrontFallbackProducts, H as scheduleIdleTask, I as cloudinaryStaticImages, S as SiteShell } from "./router-DvCKRw9U.js";
import { S as SectionTitle } from "./SectionTitle-CUOodH3k.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
import { P as ProductCard } from "./ProductCard-BH3E7mti.js";
import "./vendor-tanstack-DkD25YnA.js";
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
const heroSlide1 = "/assets/hero-slide-1-XbIAh9Iv.jpeg";
const heroSlide2 = "/assets/hero-slide-2--YQvQG9s.jpeg";
const heroSlide3 = "/assets/hero-slide-3-Dn17nMVG.jpeg";
const heroSlide4 = "/assets/hero-slide-4-BQWRiS2Z.jpeg";
const heroSlide5 = "/assets/hero-slide-5-BWV4bsUD.jpeg";
const STATIC_HERO_SLIDES = [
  {
    _id: "static-hero-1",
    id: "static-hero-1",
    title: "Designer Fragrances",
    subtitle: "Discover iconic and luxury fragrances.",
    image: heroSlide1,
    buttonText: "Shop Now",
    link: "/shop",
    isActive: true,
    order: 1
  },
  {
    _id: "static-hero-2",
    id: "static-hero-2",
    title: "Premium Collection",
    subtitle: "Curated scents for every style.",
    image: heroSlide2,
    buttonText: "Explore",
    link: "/shop",
    isActive: true,
    order: 2
  },
  {
    _id: "static-hero-3",
    id: "static-hero-3",
    title: "Luxury Bottles",
    subtitle: "Signature perfumes from top brands.",
    image: heroSlide3,
    buttonText: "Browse",
    link: "/shop",
    isActive: true,
    order: 3
  },
  {
    _id: "static-hero-4",
    id: "static-hero-4",
    title: "Arabian Favorites",
    subtitle: "Long-lasting perfumes with rich notes.",
    image: heroSlide4,
    buttonText: "View Collection",
    link: "/shop",
    isActive: true,
    order: 4
  },
  {
    _id: "static-hero-5",
    id: "static-hero-5",
    title: "Top Arabian Brand",
    subtitle: "Best-smelling fragrances for every occasion.",
    image: heroSlide5,
    buttonText: "Shop Arabian",
    link: "/shop",
    isActive: true,
    order: 5
  }
];
const sortActiveBanners = (items) => [...items].filter((banner) => banner.isActive && banner.image).sort((left, right) => {
  const orderDelta = left.order - right.order;
  if (orderDelta !== 0) return orderDelta;
  return (left.createdAt || "").localeCompare(right.createdAt || "");
});
const isExternalHref = (href) => /^https?:\/\//i.test(href);
const Hero = reactExports.memo(function Hero2() {
  const [index, setIndex] = reactExports.useState(0);
  const [documentHidden, setDocumentHidden] = reactExports.useState(false);
  const [slides, setSlides] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const mountedRef = reactExports.useRef(false);
  const slideCount = slides.length;
  reactExports.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const loadBanners = reactExports.useCallback(async (_forceFresh = false) => {
    if (!mountedRef.current) return;
    setSlides(sortActiveBanners(STATIC_HERO_SLIDES));
    setLoading(false);
  }, []);
  reactExports.useEffect(() => {
    void loadBanners();
  }, [loadBanners]);
  reactExports.useEffect(() => {
    const refreshBanners = () => {
      void loadBanners(true);
    };
    const unsubscribeCatalog = frontendEventBus.subscribe("catalog:changed", ({ scope }) => {
      if (scope === "banners" || scope === "all") {
        refreshBanners();
      }
    });
    const handleStorage = (event) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) return;
      try {
        const data = JSON.parse(event.newValue);
        if (data.name === BANNERS_CHANGED_EVENT) {
          refreshBanners();
        }
      } catch (_error) {
      }
    };
    window.addEventListener(BANNERS_CHANGED_EVENT, refreshBanners);
    window.addEventListener("storage", handleStorage);
    return () => {
      unsubscribeCatalog();
      window.removeEventListener(BANNERS_CHANGED_EVENT, refreshBanners);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadBanners]);
  reactExports.useEffect(() => {
    setIndex(0);
  }, [slideCount]);
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return void 0;
    const handleVisibility = () => {
      setDocumentHidden(document.visibilityState === "hidden");
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  reactExports.useEffect(() => {
    if (slideCount <= 1 || documentHidden) return void 0;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slideCount);
    }, 4e3);
    return () => window.clearInterval(timer);
  }, [documentHidden, slideCount]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "home-hero-slider bg-[#f7f3ed] md:py-6 lg:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full md:px-[var(--page-gutter)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "home-hero-slider__frame mx-auto w-full animate-pulse bg-[#ece3d7] md:max-w-[var(--container-max)]" }) }) });
  }
  if (slides.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "home-hero-slider bg-[#f7f3ed] md:py-6 lg:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full md:px-[var(--page-gutter)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "home-hero-slider__frame relative isolate mx-auto w-full overflow-hidden bg-[#17110f] md:max-w-[var(--container-max)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "home-hero-slider__track flex h-full transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
      style: { transform: `translate3d(-${index * 100}%, 0, 0)` },
      children: slides.map((slide, slideIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "article",
        {
          className: "relative min-w-full overflow-hidden bg-[#17110f]",
          "aria-hidden": slideIndex !== index,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: slide.link || "/shop",
              target: isExternalHref(slide.link) ? "_blank" : void 0,
              rel: isExternalHref(slide.link) ? "noreferrer" : void 0,
              className: "block h-full w-full",
              "aria-label": slide.buttonText || slide.title || "Shop fragrances",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: slide.image,
                  alt: slide.title || "Purefumes hero banner",
                  width: 1600,
                  height: 900,
                  loading: slideIndex === 0 ? "eager" : "lazy",
                  decoding: "async",
                  fetchPriority: slideIndex === 0 ? "high" : "auto",
                  sizes: "100vw",
                  className: "home-hero-slider__image h-full w-full object-cover object-center"
                }
              )
            }
          )
        },
        slide.id || slideIndex
      ))
    }
  ) }) }) });
});
const Categories = reactExports.memo(function Categories2() {
  const [categories, setCategories] = reactExports.useState([]);
  const visibleCategories = filterStorefrontCategories(categories);
  reactExports.useEffect(() => {
    let active = true;
    void categoriesApi.list().then((nextCategories) => {
      if (!active) return;
      setCategories(nextCategories);
    }).catch(() => {
      if (!active) return;
      setCategories([]);
    });
    return () => {
      active = false;
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "categories", className: "bg-[#f7f3ed] py-[var(--section-space)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SectionTitle,
      {
        eyebrow: "Curated Collections",
        title: "Explore Our Universe",
        subtitle: "Every fragrance tells a story. Find the scent that becomes part of yours."
      }
    ),
    visibleCategories.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CategoryRail,
        {
          categories: visibleCategories,
          allLabel: "Shop All",
          allHref: "/shop",
          hrefBuilder: (category) => `/shop?category=${category.slug}`
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "adaptive-card-grid mt-8", children: (visibleCategories.some((category) => category.featured) ? visibleCategories.filter((category) => category.featured) : visibleCategories).map((category, index) => {
        const image = category.image || "";
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 34 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-50px" },
            transition: { duration: 0.65, delay: index * 0.08, ease: "easeOut" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `/category/${category.slug}`,
                className: "group relative block aspect-[4/5] overflow-hidden rounded-[clamp(1.3rem,2vw,1.8rem)] bg-[#efe7dc] shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_28px_60px_-38px_rgba(91,58,41,0.38)]",
                children: [
                  image ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    OptimizedImage,
                    {
                      src: image,
                      alt: category.name,
                      width: 1024,
                      height: 1280,
                      sizes: "(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) calc((100vw - 3.75rem) / 2), 24vw",
                      wrapperClassName: "h-full w-full",
                      className: "h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center bg-[#efe7dc] px-6 text-center font-display text-4xl text-[#5b3a29]/28", children: category.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#1e1b18]/72 via-[#1e1b18]/22 to-transparent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-5 text-[#fffaf4] sm:p-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "fluid-eyebrow uppercase text-[#e6c79c]", children: [
                      category.productCount,
                      " fragrance",
                      category.productCount === 1 ? "" : "s"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-display text-[clamp(1.5rem,2vw+1rem,2.3rem)] transition duration-300 ease-in-out group-hover:translate-x-1", children: category.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 line-clamp-2 text-sm leading-6 text-[#fffaf4]/82", children: category.description || "Discover the collection" })
                  ] })
                ]
              }
            )
          },
          category.id
        );
      }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 rounded-[1.8rem] border border-border/60 bg-white/70 px-6 py-8 text-center shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/60", children: "Add categories from admin to feature them here." }) })
  ] }) });
});
const Bestsellers = reactExports.memo(function Bestsellers2() {
  useRenderInstrumentation();
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const showcaseProducts = products.slice(0, 6);
  reactExports.useEffect(() => {
    const loadBestsellers = async ({ silent = false, forceFresh = true } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      try {
        if (false) ;
        const nextProducts = await productsApi.listBestsellers({ forceFresh });
        setProducts(nextProducts.length ? nextProducts : storefrontFallbackProducts);
        setError("");
      } catch (nextError) {
        if (!silent) {
          setProducts(storefrontFallbackProducts);
          setError(
            nextError instanceof Error ? nextError.message : "Bestsellers could not be loaded right now."
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    };
    const refreshFromSignals = () => {
      void loadBestsellers({ silent: true, forceFresh: true });
    };
    const handleStorage = (event) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) {
        return;
      }
      try {
        const payload = JSON.parse(event.newValue);
        if (payload.name === BESTSELLERS_CHANGED_EVENT) {
          refreshFromSignals();
        }
      } catch (_error) {
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshFromSignals();
      }
    };
    void loadBestsellers({ forceFresh: false });
    const intervalId = window.setInterval(() => {
      void loadBestsellers({ silent: true, forceFresh: false });
    }, 3e4);
    window.addEventListener(BESTSELLERS_CHANGED_EVENT, refreshFromSignals);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshFromSignals);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(BESTSELLERS_CHANGED_EVENT, refreshFromSignals);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshFromSignals);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      id: "bestsellers",
      className: "bestsellers bg-[linear-gradient(180deg,rgba(235,222,212,0.28),rgba(247,243,239,0.96))] py-[var(--section-space)]",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SectionTitle,
          {
            eyebrow: "Most Loved",
            title: "Bestsellers",
            subtitle: "Most loved fragrances from our collection"
          }
        ),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-12", children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-[1.6rem] border border-border/70 bg-white/80 p-3 shadow-soft md:p-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square rounded-xl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-4/5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-16" })
              ] })
            ]
          },
          index
        )) }) : showcaseProducts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-grid mt-12", children: showcaseProducts.map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProductCard,
          {
            product,
            showSize: true,
            variant: "bestseller",
            imageLoading: index < 3 ? "eager" : "lazy",
            imageFetchPriority: index < 3 ? "high" : "auto"
          },
          product.id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 rounded-[1.8rem] border border-border/60 bg-white/70 px-6 py-8 text-center shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/60", children: error || "No bestsellers selected yet." }) })
      ] })
    }
  );
});
const DeferredSection = reactExports.memo(function DeferredSection2({
  children,
  fallback = null,
  rootMargin = "800px 0px",
  idleTimeoutMs = 1800
}) {
  const rootRef = reactExports.useRef(null);
  const [ready, setReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (ready) return;
    let cancelled = false;
    let cancelIdleTask;
    const reveal = () => {
      if (cancelled) return;
      cancelIdleTask = scheduleIdleTask(
        () => {
          if (!cancelled) {
            setReady(true);
          }
        },
        { timeoutMs: idleTimeoutMs }
      );
    };
    if (typeof IntersectionObserver === "undefined" || !rootRef.current) {
      reveal();
      return () => {
        cancelled = true;
        cancelIdleTask?.();
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(rootRef.current);
    return () => {
      cancelled = true;
      cancelIdleTask?.();
      observer.disconnect();
    };
  }, [idleTimeoutMs, ready, rootMargin]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: rootRef, children: ready ? children : fallback });
});
const adaptiveComponentFactory = {
  createDeferredFallback({ minHeightClass, tone = "background" }) {
    const backgroundClass = tone === "beige" ? "bg-beige/20" : "bg-background";
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${minHeightClass} ${backgroundClass}`, "aria-hidden": "true" });
  },
  productCardVariant(options) {
    if (options.isPromoted) return "bestseller";
    return "default";
  }
};
const desktopStrategy = {
  name: "desktop",
  imageLoading: "lazy",
  imageDecoding: "async",
  fetchPriority: "auto",
  deferBelowFold: true,
  reduceMotion: false,
  prefetchDistancePx: 900
};
const getFallbackLoadingStrategy = () => desktopStrategy;
const detectLoadingStrategy = () => {
  if (typeof window === "undefined") {
    return desktopStrategy;
  }
  const connection = navigator.connection;
  const isLowBandwidth = Boolean(connection?.saveData) || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isLowBandwidth) {
    return {
      name: "low-bandwidth",
      imageLoading: "lazy",
      imageDecoding: "async",
      fetchPriority: "low",
      deferBelowFold: true,
      reduceMotion: true,
      prefetchDistancePx: 300
    };
  }
  if (isMobile) {
    return {
      name: "mobile",
      imageLoading: "lazy",
      imageDecoding: "async",
      fetchPriority: "auto",
      deferBelowFold: true,
      reduceMotion,
      prefetchDistancePx: 500
    };
  }
  return {
    name: "aggressive-preload",
    imageLoading: "lazy",
    imageDecoding: "async",
    fetchPriority: "auto",
    deferBelowFold: true,
    reduceMotion,
    prefetchDistancePx: 1100
  };
};
const useAdaptiveLoadingStrategy = () => {
  const [strategy, setStrategy] = reactExports.useState(getFallbackLoadingStrategy);
  reactExports.useEffect(() => {
    const updateStrategy = () => setStrategy(detectLoadingStrategy());
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    updateStrategy();
    mobileQuery.addEventListener("change", updateStrategy);
    motionQuery.addEventListener("change", updateStrategy);
    connection?.addEventListener?.("change", updateStrategy);
    return () => {
      mobileQuery.removeEventListener("change", updateStrategy);
      motionQuery.removeEventListener("change", updateStrategy);
      connection?.removeEventListener?.("change", updateStrategy);
    };
  }, []);
  return strategy;
};
const LatestProducts = reactExports.lazy(() => import("./LatestProducts-D1yoleH7.js").then((module) => ({
  default: module.LatestProducts
})));
const PerfumeRequestSection = reactExports.lazy(() => import("./PerfumeRequestSection-Dn1oZfYl.js").then((module) => ({
  default: module.PerfumeRequestSection
})));
const AboutUs = reactExports.lazy(() => import("./AboutUs-CTUT61Wv.js").then((module) => ({
  default: module.AboutUs
})));
const Testimonials = reactExports.lazy(() => import("./Testimonials-CNdoLQLz.js").then((module) => ({
  default: module.Testimonials
})));
function Index() {
  useRenderInstrumentation();
  const loadingStrategy = useAdaptiveLoadingStrategy();
  const latestFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[22rem]"
  });
  const requestFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[18rem]"
  });
  const aboutFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[24rem]"
  });
  const testimonialFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[20rem]"
  });
  reactExports.useEffect(() => {
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://res.cloudinary.com";
    document.head.append(preconnect);
    const productPreloads = Object.values(cloudinaryStaticImages.products).map((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.setAttribute("fetchpriority", "high");
      document.head.append(link);
      return link;
    });
    return () => {
      preconnect.remove();
      productPreloads.forEach((link) => link.remove());
    };
  }, []);
  reactExports.useEffect(() => {
    const scrollToHashTarget = () => {
      const sectionId = window.location.hash.replace(/^#/, "").trim();
      if (!sectionId) return;
      window.requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    };
    const timeoutId = window.setTimeout(scrollToHashTarget, 0);
    window.addEventListener("hashchange", scrollToHashTarget);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("hashchange", scrollToHashTarget);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SiteShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Hero, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Categories, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeferredSection, { rootMargin: `${loadingStrategy.prefetchDistancePx}px 0px`, fallback: latestFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: latestFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LatestProducts, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Bestsellers, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeferredSection, { rootMargin: `${loadingStrategy.prefetchDistancePx}px 0px`, fallback: aboutFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: aboutFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AboutUs, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeferredSection, { rootMargin: `${loadingStrategy.prefetchDistancePx}px 0px`, fallback: testimonialFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: testimonialFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Testimonials, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeferredSection, { rootMargin: `${loadingStrategy.prefetchDistancePx}px 0px`, fallback: requestFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: requestFallback, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PerfumeRequestSection, {}) }) })
  ] });
}
export {
  Index as component
};
