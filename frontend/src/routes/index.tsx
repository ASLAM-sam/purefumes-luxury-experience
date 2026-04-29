import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Bestsellers } from "@/components/sections/Bestsellers";
import { AboutUs } from "@/components/sections/AboutUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { PerfumeRequestSection } from "@/components/sections/PerfumeRequestSection";
import { Container } from "@/components/common/Container";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
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
      <FeaturedProducts />
      <Bestsellers />
      <section className="bg-beige/20 py-12 md:py-16">
        <Container>
          <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,238,232,0.92))] px-6 py-8 shadow-soft md:flex md:items-center md:justify-between md:px-10">
            <div className="max-w-2xl">
              <p className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/90">
                Brand Directory
              </p>
              <h2 className="mt-3 font-display text-3xl text-navy sm:text-4xl">
                Discover every fragrance house in one place
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-navy/65 sm:text-base">
                Browse the full A-Z catalogue, search by name, and jump straight into each brand
                collection from the dedicated directory page.
              </p>
            </div>

            <div className="mt-6 md:mt-0 md:pl-8">
              <Link
                to="/brands"
                className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-[0.72rem] uppercase tracking-[0.28em] text-beige transition hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(212,175,55,0.35)]"
              >
                Explore All Brands
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
      <PerfumeRequestSection />
      <AboutUs />
      <Testimonials />
    </SiteShell>
  );
}
