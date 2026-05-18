import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CategoryRail } from "@/components/category/CategoryRail";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import type { Category } from "@/data/categories";
import { filterStorefrontCategories } from "@/lib/categories";
import { categoriesApi } from "@/services/api";

const getCategoryImage = (category: Category) => category.image || "";

export const Categories = memo(function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const visibleCategories = filterStorefrontCategories(categories);

  useEffect(() => {
    let active = true;

    void categoriesApi
      .list()
      .then((nextCategories) => {
        if (!active) return;
        setCategories(nextCategories);
      })
      .catch(() => {
        if (!active) return;
        setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="categories" className="bg-[#f7f3ed] py-[var(--section-space)]">
      <Container>
        <SectionTitle
          eyebrow="Curated Collections"
          title="Explore Our Universe"
          subtitle="Every fragrance family on the storefront now flows from admin-managed categories."
        />

        {visibleCategories.length > 0 ? (
          <>
            <div className="mt-8">
              <CategoryRail
                categories={visibleCategories}
                allLabel="Shop All"
                allHref="/shop"
                hrefBuilder={(category) => `/shop?category=${category.slug}`}
              />
            </div>

            <div className="adaptive-card-grid mt-8">
              {(visibleCategories.some((category) => category.featured)
                ? visibleCategories.filter((category) => category.featured)
                : visibleCategories
              ).map((category, index) => {
              const image = getCategoryImage(category);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.65, delay: index * 0.08, ease: "easeOut" }}
                >
                  <a
                    href={`/category/${category.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[clamp(1.3rem,2vw,1.8rem)] bg-[#efe7dc] shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_28px_60px_-38px_rgba(91,58,41,0.38)]"
                  >
                    {image ? (
                      <OptimizedImage
                        src={image}
                        alt={category.name}
                        width={1024}
                        height={1280}
                        sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) calc((100vw - 3.75rem) / 2), 24vw"
                        wrapperClassName="h-full w-full"
                        className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#efe7dc] px-6 text-center font-display text-4xl text-[#5b3a29]/28">
                        {category.name}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b18]/72 via-[#1e1b18]/22 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-[#fffaf4] sm:p-6">
                      <p className="fluid-eyebrow uppercase text-[#e6c79c]">
                        {category.productCount} fragrance{category.productCount === 1 ? "" : "s"}
                      </p>
                      <h3 className="mt-3 font-display text-[clamp(1.5rem,2vw+1rem,2.3rem)] transition duration-300 ease-in-out group-hover:translate-x-1">
                        {category.name}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#fffaf4]/82">
                        {category.description || "Discover the collection"}
                      </p>
                    </div>
                  </a>
                </motion.div>
              );
              })}
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-[1.8rem] border border-border/60 bg-white/70 px-6 py-8 text-center shadow-soft">
            <p className="text-sm text-navy/60">Add categories from admin to feature them here.</p>
          </div>
        )}
      </Container>
    </section>
  );
});
