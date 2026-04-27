import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductCard } from "@/components/product/ProductCard";
import { brandsApi, productsApi } from "@/services/api";

const formatCategory = (category: string) =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const Route = createFileRoute("/brand/$brandId")({
  loader: async ({ params }) => {
    try {
      const [brand, products] = await Promise.all([
        brandsApi.get(params.brandId),
        productsApi.list({ brandId: params.brandId }),
      ]);

      if (!brand) {
        throw notFound();
      }

      return { brand, products };
    } catch (error) {
      if (error instanceof Error && /brand not found|invalid brand id/i.test(error.message)) {
        throw notFound();
      }

      throw error;
    }
  },
  component: BrandPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-40 text-center font-display text-3xl text-navy">Brand not found</div>
    </SiteShell>
  ),
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="py-40 text-center text-navy">Error: {error.message}</div>
    </SiteShell>
  ),
});

function BrandPage() {
  const { brand, products } = Route.useLoaderData();
  const subtitle = products.length
    ? `${products.length} perfume${products.length === 1 ? "" : "s"} from ${brand.name}.`
    : "No products under this brand yet.";

  return (
    <SiteShell>
      <section className="py-14 md:py-20">
        <Container>
          <Link
            to="/brands"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-navy/60 hover:text-navy"
          >
            <ChevronLeft className="h-4 w-4" /> Back to brands
          </Link>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-beige shadow-soft ring-1 ring-border md:h-28 md:w-28">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    loading="lazy"
                    className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20"
                  />
                ) : (
                  <span className="font-display text-4xl text-navy md:text-5xl">
                    {brand.fallbackLetter || brand.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <SectionTitle
                  eyebrow="House"
                  title={brand.name}
                  subtitle={subtitle}
                  center={false}
                />
              </div>
            </div>

            <div className="w-full rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-soft sm:w-auto">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-navy/55">Category</p>
              <p className="mt-2 font-display text-2xl text-navy">
                {formatCategory(brand.category)}
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mx-auto mt-16 max-w-xl text-center">
              <p className="font-display text-2xl text-ink">No products under this brand</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Products linked to {brand.name} will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </SiteShell>
  );
}
