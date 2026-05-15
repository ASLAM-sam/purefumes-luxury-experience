import { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import type { Product } from "@/data/products";
import { productsApi } from "@/services/api";

type CategoryCard = {
  name: string;
  href: string;
  tagline: string;
  product?: Product;
};

const baseCards: CategoryCard[] = [
  {
    name: "Middle Eastern",
    href: "/shop?category=middle-eastern",
    tagline: "Oud, amber, saffron",
  },
  { name: "Designer", href: "/shop?category=designer", tagline: "Iconic house names" },
  { name: "Niche", href: "/shop?category=niche", tagline: "Rare and artisanal" },
  { name: "Best Sellers", href: "/shop?sort=bestseller", tagline: "Loved by connoisseurs" },
];

const getImage = (product?: Product) => product?.images?.find(Boolean) || product?.image || "";

export const Categories = memo(function Categories() {
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product | undefined>>({});
  const [bestseller, setBestseller] = useState<Product | undefined>();

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const [middleEastern, designer, niche, bestsellers] = await Promise.all([
          productsApi.list({ category: "Middle Eastern", page: 1, limit: 1 }),
          productsApi.list({ category: "Designer", page: 1, limit: 1 }),
          productsApi.list({ category: "Niche", page: 1, limit: 1 }),
          productsApi.listBestsellers(),
        ]);

        if (!active) return;

        setCategoryProducts({
          "Middle Eastern": middleEastern[0],
          Designer: designer[0],
          Niche: niche[0],
        });
        setBestseller(bestsellers[0]);
      } catch (_error) {
        if (!active) return;
        setCategoryProducts({});
        setBestseller(undefined);
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () =>
      baseCards.map((card) => ({
        ...card,
        product: card.name === "Best Sellers" ? bestseller : categoryProducts[card.name],
      })),
    [bestseller, categoryProducts],
  );

  return (
    <section id="categories" className="bg-[#f7f3ed] py-16 md:py-24">
      <Container>
        <SectionTitle eyebrow="Curated Collections" title="Explore Our Universe" />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const image = getImage(card.product);

            return (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: "easeOut" }}
              >
                <a
                  href={card.href}
                  className="group relative block aspect-[3/4] overflow-hidden bg-[#efe7dc] shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_28px_60px_-38px_rgba(91,58,41,0.38)]"
                >
                  {image ? (
                    <OptimizedImage
                      src={image}
                      alt={card.product?.name || card.name}
                      width={1024}
                      height={1280}
                      sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) calc((100vw - 3.75rem) / 2), 24vw"
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#efe7dc] px-6 text-center font-display text-4xl text-[#5b3a29]/28">
                      {card.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b18]/72 via-[#1e1b18]/22 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-[#fffaf4]">
                    <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[#e6c79c]">
                      {card.tagline}
                    </p>
                    <h3 className="mt-3 font-display text-3xl transition duration-300 ease-in-out group-hover:translate-x-1">
                      {card.name}
                    </h3>
                    <p className="mt-3 text-xs uppercase tracking-[0.26em] text-[#fffaf4]/82">
                      Discover
                    </p>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
});
