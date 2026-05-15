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
      className="overflow-hidden rounded-[1.85rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_48px_rgba(7,31,63,0.1)] backdrop-blur"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-navy">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-7 text-navy/58">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
});
