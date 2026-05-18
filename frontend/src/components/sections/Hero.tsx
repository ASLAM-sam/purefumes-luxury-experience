import { memo, useEffect, useMemo, useState } from "react";

import fallbackHeroImage from "@/assets/hero.jpg?url";
import fallbackPerfumeImage from "@/assets/perfume-1.jpg?url";
import { bannersApi, type Banner } from "@/services/api";

type HeroSlide = {
  id: string;
  category: string;
  heading: string;
  image: string;
  link: string;
};

const fallbackSlides: HeroSlide[] = [
  {
    id: "purefumes-signature",
    category: "Premium Collection",
    heading: "Signature Scents",
    image: fallbackHeroImage,
    link: "/shop",
  },
  {
    id: "purefumes-arrivals",
    category: "New Arrivals",
    heading: "Luxury Perfumes",
    image: fallbackPerfumeImage,
    link: "/shop?sort=latest",
  },
];

const toHeroSlide = (banner: Banner): HeroSlide => ({
  id: banner.id || banner._id,
  category: banner.title?.trim() || "Premium Collection",
  heading: banner.subtitle?.trim() || banner.title?.trim() || "Luxury Perfumes",
  image: banner.image,
  link: banner.link?.trim() || "/shop",
});

export const Hero = memo(function Hero() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);
  const [documentHidden, setDocumentHidden] = useState(false);

  useEffect(() => {
    let active = true;

    const loadBanners = async () => {
      try {
        const next = await bannersApi.listActive();

        if (active) {
          setBanners([...next].sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      } catch {
        if (active) {
          setBanners([]);
        }
      }
    };

    void loadBanners();

    return () => {
      active = false;
    };
  }, []);

  const slides = useMemo(() => {
    const adminSlides = banners.map(toHeroSlide).filter((slide) => slide.image);
    return adminSlides.length > 0 ? adminSlides : fallbackSlides;
  }, [banners]);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

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
    if (slides.length <= 1 || documentHidden) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [documentHidden, slides.length]);

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
                <img
                  src={slide.image}
                  alt={slide.heading}
                  width={1600}
                  height={900}
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={slideIndex === 0 ? "high" : "auto"}
                  sizes="100vw"
                  className="home-hero-slider__image absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,11,10,0.9)_0%,rgba(15,11,10,0.68)_36%,rgba(15,11,10,0.18)_70%,rgba(15,11,10,0.04)_100%)]" />
                <div className="absolute inset-0 flex items-center">
                  <div className="home-hero-slider__copy px-5 py-5 text-[#fffaf4] sm:px-8 md:px-10 lg:px-14">
                    <p className="text-[0.58rem] font-semibold uppercase leading-none tracking-[0.28em] text-[#d4a462] sm:text-[0.68rem]">
                      {slide.category}
                    </p>
                    <h1 className="mt-2 max-w-[11.5rem] font-display text-[clamp(1.65rem,8vw,2.9rem)] leading-[0.9] tracking-[0.01em] text-white sm:max-w-[18rem] md:max-w-[28rem] md:text-[clamp(2.9rem,5vw,5rem)]">
                      {slide.heading}
                    </h1>
                    <a
                      href={slide.link}
                      className="mt-4 inline-flex min-h-10 items-center justify-center bg-[#d4a462] px-5 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#17110f] shadow-[0_18px_36px_-22px_rgba(212,164,98,0.95)] transition hover:bg-[#e3bd83] sm:mt-6 sm:min-h-11 sm:px-7"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
