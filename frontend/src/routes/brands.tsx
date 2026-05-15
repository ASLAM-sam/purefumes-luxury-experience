import { createFileRoute } from "@tanstack/react-router";
import { BrandDirectory } from "@/components/brand/BrandDirectory";
import { Container } from "@/components/common/Container";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  return (
    <SiteShell>
      <section className="py-16 md:py-20">
        <Container>
          <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,238,232,0.92))] px-6 py-8 shadow-soft md:px-10 md:py-10">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/90">
              Brand Directory
            </p>
            <h1 className="mt-3 font-display text-4xl text-navy sm:text-5xl">Brands A-Z</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-navy/65 sm:text-base">
              Search the fragrance houses we carry, filter the list by letter, and step directly
              into each brand collection from one clean directory page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/75">
                Live Brand Search
              </span>
              <span className="rounded-full border border-border bg-white/75 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/65">
                A-Z Filter
              </span>
              <span className="rounded-full border border-border bg-white/75 px-4 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-navy/65">
                Responsive Directory
              </span>
            </div>
          </div>
          <div className="mt-12">
            <BrandDirectory searchable />
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
