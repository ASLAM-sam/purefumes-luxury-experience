import { memo } from "react";
import { motion } from "framer-motion";
import type { Accord } from "@/data/products";

export const AccordBars = memo(function AccordBars({ accords }: { accords: Accord[] }) {
  return (
    <div className="space-y-3">
      {accords.map((a, i) => (
        <div key={a.name} className="flex items-center gap-4">
          <span className="w-24 shrink-0 text-xs uppercase tracking-[0.2em] text-navy/70 font-medium">
            {a.name}
          </span>
          <div className="flex-1 h-3 rounded-full bg-beige overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${a.percentage}%` }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
              className="h-full rounded-full bg-gold shadow-soft"
            />
          </div>
          <span className="w-10 text-right text-xs tabular-nums text-navy/60">{a.percentage}%</span>
        </div>
      ))}
    </div>
  );
});
