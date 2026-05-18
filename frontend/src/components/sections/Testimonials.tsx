import { memo } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";
import { testimonials } from "@/data/products";

export const Testimonials = memo(function Testimonials() {
  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionTitle eyebrow="Voices" title="Customer Reviews" />
      </Container>

      <div className="mt-10 overflow-hidden md:mt-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-5 md:gap-6 md:px-8 lg:flex lg:gap-8 lg:overflow-x-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="w-full max-w-full rounded-xl border border-border bg-card p-6 shadow-soft md:p-8 lg:w-[420px] lg:shrink-0"
            >
              <Quote className="h-6 w-6 text-gold" />
              <p className="mt-5 text-[0.82rem] uppercase tracking-[0.3em] text-gold">5 stars</p>
              <blockquote className="mt-5 font-display text-[1.35rem] italic leading-relaxed text-navy md:text-2xl">
                "{testimonial.text}"
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-6 text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground md:text-[0.7rem] md:tracking-[0.32em]">
                {testimonial.name} | <span className="text-gold">{testimonial.location}</span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
