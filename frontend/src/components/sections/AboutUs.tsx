import { memo } from "react";
import { BadgeCheck, FlaskConical, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { SectionTitle } from "@/components/common/SectionTitle";

const highlights = [
  {
    title: "Authentic Fragrances",
    description: "Carefully sourced and selected perfumes.",
    Icon: BadgeCheck,
  },
  {
    title: "Premium Decants",
    description: "Try luxury scents before committing to full bottles.",
    Icon: FlaskConical,
  },
  {
    title: "Hyderabad Based",
    description: "Serving fragrance lovers with trusted local support.",
    Icon: MapPin,
  },
] as const;

export const AboutUs = memo(function AboutUs() {
  return (
    <section
      id="about-us"
      className="bg-[linear-gradient(180deg,rgba(247,243,239,0.45),rgba(235,222,212,0.36))] py-16 md:py-20"
    >
      <Container>
        <div className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(241,231,222,0.92))] p-6 shadow-soft sm:p-8 md:p-12">
          <SectionTitle
            eyebrow="Our Story"
            title="About Purefumes Hyderabad"
            subtitle="Purefumes Hyderabad curates authentic luxury fragrances, designer scents, niche perfumes, and premium decants for fragrance lovers. From everyday signatures to rare finds, we help you discover scents that feel personal, elegant, and memorable."
          />

          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3">
            {highlights.map(({ title, description, Icon }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="group rounded-[1.6rem] border border-border/65 bg-white/80 p-6 shadow-[0_18px_36px_-26px_rgba(7,32,63,0.3)] transition duration-300 ease-in-out hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_24px_48px_-24px_rgba(7,32,63,0.34)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/25 bg-navy/95 text-gold transition duration-300 ease-in-out group-hover:border-gold/45 group-hover:bg-navy">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-[1.55rem] text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-navy/65">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
});
