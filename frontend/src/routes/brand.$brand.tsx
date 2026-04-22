import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ProductCard } from "@/components/product/ProductCard";
import { productsApi } from "@/services/api";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/brand/$brand")({
  component: BrandPage,
});

function BrandPage() {
  const { brand } = Route.useParams();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi
      .list()
      .then((list) =>
        setProducts(
          list.filter((product) => product.brand.toLowerCase() === brand.toLowerCase()),
        ),
      )
      .catch(() => setProducts([]));
  }, [brand]);

  const display = useMemo(() => products[0]?.brand ?? brand, [brand, products]);

  return (
    <SiteShell>
      <section className="py-20">
        <Container>
          <SectionTitle
            eyebrow="House"
            title={display}
            subtitle={products.length ? `Signature creations from ${display}.` : "No fragrances available."}
          />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
