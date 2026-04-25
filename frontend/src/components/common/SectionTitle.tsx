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
      className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}
    >
      {eyebrow && (
        <p className="mb-4 text-[0.68rem] font-medium uppercase tracking-[0.42em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl leading-[0.95] text-foreground sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-sm leading-7 text-muted-foreground md:text-base ${
            center ? "mx-auto max-w-2xl" : "max-w-xl"
          }`}
        >
          {subtitle}
        </p>
      )}
      <div className={`mt-6 h-px w-24 gold-line ${center ? "mx-auto" : ""}`} />
    </motion.div>
  );
});
