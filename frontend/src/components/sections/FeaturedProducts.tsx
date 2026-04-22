import { memo, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ProductCard } from "@/components/product/ProductCard";
import { productsApi } from "@/services/api";
import type { Product } from "@/data/products";

export const FeaturedProducts = memo(function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const featured = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((product) => {
      if (seen.has(product.brand)) return false;
      seen.add(product.brand);
      return true;
    });
  }, [products]);

  return (
    <section id="featured" className="py-32 bg-beige/30">
      <Container>
        <SectionTitle
          eyebrow="The Collection"
          title="Featured Fragrances"
          subtitle="One signature scent from every house we carry."
        />
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
});
