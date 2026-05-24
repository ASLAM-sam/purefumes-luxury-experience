import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  BANNERS_CHANGED_EVENT,
  DATA_EVENT_STORAGE_KEY,
  type Banner,
} from "@/services/api";
import { frontendEventBus } from "@/lib/performance/event-bus";
import heroSlide1 from "@/assets/hero-slide-1.jpeg";
import heroSlide2 from "@/assets/hero-slide-2.jpeg";
import heroSlide3 from "@/assets/hero-slide-3.jpeg";
import heroSlide4 from "@/assets/hero-slide-4.jpeg";
import heroSlide5 from "@/assets/hero-slide-5.jpeg";

const STATIC_HERO_SLIDES: Banner[] = [
  {
    _id: "static-hero-1",
    id: "static-hero-1",
    title: "Designer Perfumes",
    subtitle: "Discover iconic and luxury fragrances.",
    image: heroSlide1,
    buttonText: "Shop Now",
    link: "/shop",
    isActive: true,
    order: 1,
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
  },
];

const sortActiveBanners = (items: Banner[]) =>
  [...items]
    .filter((banner) => banner.isActive && banner.image)
    .sort((left, right) => {
      const orderDelta = left.order - right.order;
      if (orderDelta !== 0) return orderDelta;
      return (left.createdAt || "").localeCompare(right.createdAt || "");
    });

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

export const Hero = memo(function Hero() {
  const [index, setIndex] = useState(0);
  const [documentHidden, setDocumentHidden] = useState(false);
  const [slides, setSlides] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  const slideCount = slides.length;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadBanners = useCallback(async (_forceFresh = false) => {
    if (!mountedRef.current) return;
    setSlides(sortActiveBanners(STATIC_HERO_SLIDES));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    const refreshBanners = () => {
      void loadBanners(true);
    };

    const unsubscribeCatalog = frontendEventBus.subscribe("catalog:changed", ({ scope }) => {
      if (scope === "banners" || scope === "all") {
        refreshBanners();
      }
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DATA_EVENT_STORAGE_KEY || !event.newValue) return;

      try {
        const data = JSON.parse(event.newValue) as { name?: string };
        if (data.name === BANNERS_CHANGED_EVENT) {
          refreshBanners();
        }
      } catch (_error) {
        // Ignore malformed cross-tab data events.
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

  useEffect(() => {
    setIndex(0);
  }, [slideCount]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const handleVisibility = () => {
      setDocumentHidden(document.visibilityState === "hidden");
    };

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (slideCount <= 1 || documentHidden) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slideCount);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [documentHidden, slideCount]);

  if (loading) {
    return (
      <section className="home-hero-slider bg-[#f7f3ed] md:py-6 lg:py-8">
        <div className="w-full md:px-[var(--page-gutter)]">
          <div className="home-hero-slider__frame mx-auto w-full animate-pulse bg-[#ece3d7] md:max-w-[var(--container-max)]" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="home-hero-slider bg-[#f7f3ed] md:py-6 lg:py-8">
      <div className="w-full md:px-[var(--page-gutter)]">
        <div className="home-hero-slider__frame relative isolate mx-auto w-full overflow-hidden bg-[#17110f] md:max-w-[var(--container-max)]">
          <div
            className="home-hero-slider__track flex h-full transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
            style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          >
            {slides.map((slide, slideIndex) => (
              <article
                key={slide.id || slideIndex}
                className="relative min-w-full overflow-hidden bg-[#17110f]"
                aria-hidden={slideIndex !== index}
              >
                <a
                  href={slide.link || "/shop"}
                  target={isExternalHref(slide.link) ? "_blank" : undefined}
                  rel={isExternalHref(slide.link) ? "noreferrer" : undefined}
                  className="block h-full w-full"
                  aria-label={slide.buttonText || slide.title || "Shop fragrances"}
                >
                  <img
                    src={slide.image}
                    alt={slide.title || "Purefumes hero banner"}
                    width={1600}
                    height={900}
                    loading={slideIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={slideIndex === 0 ? "high" : "auto"}
                    sizes="100vw"
                    className="home-hero-slider__image h-full w-full object-cover object-center"
                  />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
