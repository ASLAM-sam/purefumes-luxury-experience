import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Testimonials } from "@/components/sections/Testimonials";
import { BrandAZ } from "@/components/brand/BrandAZ";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <section className="bg-beige/20 py-16 md:py-20">
        <Container>
          <SectionTitle
            eyebrow="The Houses"
            title="Brands A - Z"
            subtitle="Filter by letter to discover our curated roster of fragrance houses."
          />
          <div className="mt-12">
            <BrandAZ />
          </div>
        </Container>
      </section>
      <Testimonials />
    </SiteShell>
  );
}
