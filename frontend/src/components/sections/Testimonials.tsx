import { memo } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { testimonials } from "@/data/products";
import { Quote } from "lucide-react";

export const Testimonials = memo(function Testimonials() {
  return (
    <section className="py-32">
      <Container>
        <SectionTitle eyebrow="Voices" title="From Our Patrons" />
      </Container>
      <div className="mt-16 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="flex gap-8 px-6 md:px-10 overflow-x-auto no-scrollbar snap-x snap-mandatory"
        >
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="snap-start shrink-0 w-[85vw] md:w-[420px] p-8 rounded-2xl border border-border bg-card shadow-soft"
            >
              <Quote className="w-6 h-6 text-gold" />
              <blockquote className="mt-5 text-base md:text-lg font-display italic leading-relaxed">
                "{t.text}"
              </blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t.name} · <span className="text-gold">{t.location}</span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
