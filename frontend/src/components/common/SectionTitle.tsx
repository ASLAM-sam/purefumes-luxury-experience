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
        center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }
    >
      {eyebrow && (
        <p className="fluid-eyebrow mb-4 font-medium uppercase text-gold md:tracking-[0.42em]">
          {eyebrow}
        </p>
      )}
      <h2 className="fluid-section-title font-display text-foreground [overflow-wrap:anywhere]">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`fluid-body mt-5 text-muted-foreground ${
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
