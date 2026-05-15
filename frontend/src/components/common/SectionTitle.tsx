import { memo } from "react";
import { motion } from "framer-motion";

type Props = { eyebrow?: string; title: string; subtitle?: string; center?: boolean };

export const SectionTitle = memo(function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = true,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={
        center ? "mx-auto max-w-[16.5rem] text-center sm:max-w-3xl" : "max-w-[16.5rem] sm:max-w-2xl"
      }
    >
      {eyebrow && (
        <p className="mb-4 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold md:text-[0.68rem] md:tracking-[0.42em]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-[1.78rem] leading-[1] text-foreground [overflow-wrap:anywhere] sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-[0.95rem] leading-7 text-muted-foreground md:text-base ${
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
