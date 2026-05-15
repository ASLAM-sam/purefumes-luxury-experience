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
      <section className="bg-[#f7f3ed] py-16 md:py-24">
        <Container>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="mx-auto max-w-3xl border border-border bg-[#fffaf4] px-6 py-10 text-center shadow-soft md:px-12"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.36em] text-gold">
              Join the Inner Circle
            </p>
            <h2 className="mt-4 font-display text-3xl text-foreground md:text-4xl">
              Private fragrance notes, arrivals and edits
            </h2>
            <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="your@email.com"
                className="min-h-12 flex-1 border border-border bg-[#f7f3ed] px-4 text-sm text-foreground outline-none transition focus:border-gold"
              />
              <button
                type="submit"
                className="min-h-12 bg-[#8b5f3d] px-6 text-[0.68rem] uppercase tracking-[0.26em] text-[#fffaf4] transition hover:bg-[#5b3a29]"
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
