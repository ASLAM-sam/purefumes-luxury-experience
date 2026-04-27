import { createFileRoute } from "@tanstack/react-router";
import { BrandDirectory } from "@/components/brand/BrandDirectory";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  return (
    <SiteShell>
      <section className="py-20">
        <Container>
          <SectionTitle
            eyebrow="Brand Directory"
            title="Fragrance Houses"
            subtitle="Explore the perfume brands we carry, then step into each house to browse its full collection."
          />
          <div className="mt-12">
            <BrandDirectory searchable />
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
