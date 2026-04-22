import { memo } from "react";
import { motion } from "framer-motion";

type Props = { eyebrow?: string; title: string; subtitle?: string; center?: boolean };

export const SectionTitle = memo(function SectionTitle({ eyebrow, title, subtitle, center = true }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={center ? "text-center" : ""}
    >
      {eyebrow && (
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold mb-4">{eyebrow}</p>
      )}
      <h2 className="font-display text-4xl md:text-6xl text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-5 max-w-xl mx-auto text-sm md:text-base text-muted-foreground font-light">
          {subtitle}
        </p>
      )}
      <div className="mt-6 mx-auto h-px w-24 gold-line" />
    </motion.div>
  );
});
