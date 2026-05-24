import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  BANNERS_CHANGED_EVENT,
  bannersApi,
  DATA_EVENT_STORAGE_KEY,
  type Banner,
} from "@/services/api";
import { frontendEventBus } from "@/lib/performance/event-bus";

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

  const loadBanners = useCallback(async (forceFresh = false) => {
    try {
      const nextBanners = await bannersApi.listActive({ forceFresh });

      if (!mountedRef.current) return;
      setSlides(sortActiveBanners(nextBanners));
    } catch (_error) {
      if (!mountedRef.current) return;
      setSlides([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
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
