import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

type Props = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: "navy" | "gold" | "emerald" | "rose";
  meta?: ReactNode;
  loading?: boolean;
};

const toneClasses = {
  navy: "from-[#071f3f] to-[#0f2f58] text-white",
  gold: "from-[#c9a14a] to-[#e5c978] text-navy",
  emerald: "from-[#21664c] to-[#35a56f] text-white",
  rose: "from-[#7f1d1d] to-[#dc2626] text-white",
} as const;

export const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  tone = "navy",
  meta,
  loading = false,
}: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-[1px] shadow-[0_18px_48px_rgba(7,31,63,0.12)] ${toneClasses[tone]}`}
    >
      <div className="h-full rounded-[1.7rem] bg-white/88 p-5 text-navy backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-navy/55">{label}</p>
            {loading ? (
              <LoadingSkeleton className="mt-4 h-9 w-28" />
            ) : (
              <p className="mt-4 font-display text-4xl leading-none text-navy">{value}</p>
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClasses[tone]} shadow-[0_18px_30px_rgba(7,31,63,0.12)]`}
          >
            {icon}
          </div>
        </div>
        {loading ? <LoadingSkeleton className="mt-4 h-4 w-36" /> : meta ? <div className="mt-4 text-sm text-navy/60">{meta}</div> : null}
      </div>
    </motion.div>
  );
});
