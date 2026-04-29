import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import middleEasternImg from "@/assets/cat-middle-eastern.jpg";
import designerImg from "@/assets/cat-designer.jpg";
import nicheImg from "@/assets/cat-niche.jpg";

const cats = [
  {
    name: "Middle Eastern",
    slug: "middle-eastern",
    img: middleEasternImg,
    tagline: "Oud, amber, resin",
  },
  { name: "Designer", slug: "designer", img: designerImg, tagline: "Iconic houses" },
  { name: "Niche", slug: "niche", img: nicheImg, tagline: "Rare and artisan" },
];

export const Categories = memo(function Categories() {
  return (
    <section id="categories" className="py-14 md:py-20">
      <Container>
        <SectionTitle
          eyebrow="Curated Worlds"
          title="Three Realms of Fragrance"
          subtitle="From the spice markets of Arabia to the ateliers of Paris and Florence."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-12 md:gap-6 lg:grid-cols-3">
          {cats.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
            >
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
              >
                <OptimizedImage
                  src={c.img}
                  alt={c.name}
                  width={1024}
                  height={1280}
                  sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) calc((100vw - 3.75rem) / 2), 31vw"
                  className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-beige md:p-6">
                  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-gold md:text-[0.65rem] md:tracking-[0.36em]">
                    {c.tagline}
                  </p>
                  <h3 className="mt-2 font-display text-3xl transition duration-300 ease-in-out group-hover:translate-x-1 sm:text-4xl">
                    {c.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
});
