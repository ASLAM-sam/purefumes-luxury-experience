import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export const AnalyticsChart = memo(function AnalyticsChart({
  title,
  description,
  action,
  children,
}: Props) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[var(--radius-panel)] border border-white/70 bg-white/82 p-4 shadow-[0_18px_48px_rgba(7,31,63,0.1)] backdrop-blur sm:p-5 lg:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-[clamp(1.35rem,1vw+1rem,2rem)] text-navy">{title}</h2>
          {description ? <p className="fluid-body-sm mt-2 text-navy/58">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
});
