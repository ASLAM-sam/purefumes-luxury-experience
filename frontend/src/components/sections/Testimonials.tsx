import { memo } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { testimonials } from "@/data/products";

export const Testimonials = memo(function Testimonials() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <SectionTitle eyebrow="Voices" title="From Our Patrons" />
      </Container>

      <div className="mt-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="flex gap-6 overflow-x-auto px-6 no-scrollbar md:gap-8 md:px-10"
        >
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="w-[85vw] shrink-0 rounded-xl border border-border bg-card p-8 shadow-soft md:w-[420px]"
            >
              <Quote className="h-6 w-6 text-gold" />
              <blockquote className="mt-5 font-display text-xl italic leading-relaxed text-navy md:text-2xl">
                "{t.text}"
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-6 text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
                {t.name} - <span className="text-gold">{t.location}</span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
