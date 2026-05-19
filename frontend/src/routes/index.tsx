import { lazy, Suspense, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Bestsellers } from "@/components/sections/Bestsellers";
import { Container } from "@/components/common/Container";
import { DeferredSection } from "@/components/common/DeferredSection";
import { useRenderInstrumentation } from "@/hooks/useRenderInstrumentation";
import { adaptiveComponentFactory } from "@/lib/performance/component-factory";
import { useAdaptiveLoadingStrategy } from "@/lib/performance/loading-strategy";
import { cloudinaryStaticImages } from "@/lib/cloudinary-static-images";

const LatestProducts = lazy(() =>
  import("@/components/sections/LatestProducts").then((module) => ({
    default: module.LatestProducts,
  })),
);
const PerfumeRequestSection = lazy(() =>
  import("@/components/sections/PerfumeRequestSection").then((module) => ({
    default: module.PerfumeRequestSection,
  })),
);
const AboutUs = lazy(() =>
  import("@/components/sections/AboutUs").then((module) => ({
    default: module.AboutUs,
  })),
);
const Testimonials = lazy(() =>
  import("@/components/sections/Testimonials").then((module) => ({
    default: module.Testimonials,
  })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Purefumes Hyderabad | Authentic Perfumes Online" },
      {
        name: "description",
        content:
          "Shop authentic perfumes and personal care products from Purefumes Hyderabad with secure checkout, customer support, and fast delivery across India.",
      },
      { property: "og:title", content: "Purefumes Hyderabad | Authentic Perfumes Online" },
      {
        property: "og:description",
        content:
          "Discover authentic fragrances, bestsellers, latest arrivals, and trusted ecommerce support from Purefumes Hyderabad.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  useRenderInstrumentation("HomeRoute");
  const loadingStrategy = useAdaptiveLoadingStrategy();
  const latestFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[22rem]",
  });
  const requestFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[18rem]",
  });
  const aboutFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[24rem]",
  });
  const testimonialFallback = adaptiveComponentFactory.createDeferredFallback({
    minHeightClass: "min-h-[20rem]",
  });

  useEffect(() => {
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

  useEffect(() => {
    const scrollToHashTarget = () => {
      const sectionId = window.location.hash.replace(/^#/, "").trim();
      if (!sectionId) return;

      window.requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
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

  return (
    <SiteShell>
      <Hero />
      <Categories />
      <DeferredSection
        rootMargin={`${loadingStrategy.prefetchDistancePx}px 0px`}
        fallback={latestFallback}
      >
        <Suspense fallback={latestFallback}>
          <LatestProducts />
        </Suspense>
      </DeferredSection>
      <Bestsellers />
      <DeferredSection
        rootMargin={`${loadingStrategy.prefetchDistancePx}px 0px`}
        fallback={aboutFallback}
      >
        <Suspense fallback={aboutFallback}>
          <AboutUs />
        </Suspense>
      </DeferredSection>
      <DeferredSection
        rootMargin={`${loadingStrategy.prefetchDistancePx}px 0px`}
        fallback={testimonialFallback}
      >
        <Suspense fallback={testimonialFallback}>
          <Testimonials />
        </Suspense>
      </DeferredSection>
      <DeferredSection
        rootMargin={`${loadingStrategy.prefetchDistancePx}px 0px`}
        fallback={requestFallback}
      >
        <Suspense fallback={requestFallback}>
          <PerfumeRequestSection />
        </Suspense>
      </DeferredSection>
      <section className="bg-[#f7f3ed] py-[var(--section-space)]">
        <Container>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="mx-auto max-w-3xl rounded-[var(--radius-panel)] border border-border bg-[#fffaf4] px-5 py-8 text-center shadow-soft sm:px-6 md:px-12 md:py-10"
          >
            <p className="fluid-eyebrow uppercase text-gold">
              Join the Inner Circle
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.7rem,2vw+1.2rem,2.8rem)] text-foreground">
              Private fragrance notes, arrivals and edits
            </h2>
            <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="your@email.com"
                className="min-h-12 flex-1 rounded-full border border-border bg-[#f7f3ed] px-4 text-sm text-foreground outline-none transition focus:border-gold"
              />
              <button
                type="submit"
                className="min-h-12 rounded-full bg-[#8b5f3d] px-6 fluid-button-label uppercase tracking-[0.26em] text-[#fffaf4] transition hover:bg-[#5b3a29]"
              >
                Subscribe
              </button>
            </div>
          </form>
        </Container>
      </section>
    </SiteShell>
  );
}
