import { memo, useEffect, useMemo, useState } from "react";

import { homeHeroSlides } from "@/lib/static-image-overrides";

type HeroSlide = {
  id: string;
  category: string;
  heading: string;
  image: string;
  link: string;
};

const slides: HeroSlide[] = homeHeroSlides;

export const Hero = memo(function Hero() {
  const [index, setIndex] = useState(0);
  const [documentHidden, setDocumentHidden] = useState(false);

  const slideCount = useMemo(() => slides.length, []);

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
                  href={slide.link}
                  className="block h-full w-full"
                  aria-label={`Shop ${slide.category}`}
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
