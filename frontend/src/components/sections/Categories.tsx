import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import middleEasternImg from "@/assets/cat-middle-eastern.jpg";
import designerImg from "@/assets/cat-designer.jpg";
import nicheImg from "@/assets/cat-niche.jpg";

const cats = [
  { name: "Middle Eastern", slug: "middle-eastern", img: middleEasternImg, tagline: "Oud, Amber, Resin" },
  { name: "Designer", slug: "designer", img: designerImg, tagline: "Iconic Houses" },
  { name: "Niche", slug: "niche", img: nicheImg, tagline: "Rare & Artisan" },
];

export const Categories = memo(function Categories() {
  return (
    <section id="categories" className="py-32">
      <Container>
        <SectionTitle eyebrow="Curated Worlds" title="Three Realms of Fragrance" subtitle="From the spice markets of Arabia to the ateliers of Paris and Florence." />
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {cats.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
            >
              <Link to="/category/$slug" params={{ slug: c.slug }} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-soft">
                <img src={c.img} alt={c.name} loading="lazy" width={1024} height={1280}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-beige">
                  <p className="text-[0.65rem] tracking-[0.4em] text-gold uppercase">{c.tagline}</p>
                  <h3 className="font-display text-4xl mt-2 transition-transform duration-500 group-hover:translate-x-2">{c.name}</h3>
                  <div className="mt-4 h-px w-12 gold-line transition-all duration-500 group-hover:w-24" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
});
