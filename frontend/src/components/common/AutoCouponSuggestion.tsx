import { memo } from "react";
import { motion } from "framer-motion";
import { TicketPercent } from "lucide-react";

const DEFAULT_MINIMUM = 3000;
const DEFAULT_CODE = "SAVE5";

type AutoCouponSuggestionProps = {
  subtotal: number;
  appliedCode?: string;
  onApply: (code: string) => void;
  className?: string;
  tone?: "light" | "dark";
};

export const AutoCouponSuggestion = memo(function AutoCouponSuggestion({
  subtotal,
  appliedCode = "",
  onApply,
  className = "",
  tone = "light",
}: AutoCouponSuggestionProps) {
  if (subtotal < DEFAULT_MINIMUM || appliedCode) {
    return null;
  }

  const dark = tone === "dark";

  // return (
  //   <motion.div
  //     initial={{ opacity: 0, y: 8 }}
  //     animate={{ opacity: 1, y: 0 }}
  //     transition={{ duration: 0.25, ease: "easeOut" }}
  //     className={`rounded-xl border p-4 shadow-soft ${
  //       dark
  //         ? "border-gold/30 bg-gold/10 text-beige"
  //         : "border-gold/30 bg-[linear-gradient(135deg,rgba(212,175,55,0.16),rgba(255,255,255,0.88))] text-navy"
  //     } ${className}`}
  //   >
  //     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  //       <div className="flex items-start gap-3">
  //         <span
  //           className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
  //             dark ? "bg-gold text-navy" : "bg-navy text-beige"
  //           }`}
  //         >
  //           <TicketPercent className="h-4 w-4" />
  //         </span>
  //         <div>
  //           <p className="text-sm font-semibold">You unlocked 5% off</p>
  //           <p className={`mt-1 text-xs ${dark ? "text-beige/70" : "text-navy/60"}`}>
  //             Use coupon <span className="font-semibold tracking-[0.16em]">{DEFAULT_CODE}</span> on this order.
  //           </p>
  //         </div>
  //       </div>
  //       <button
  //         type="button"
  //         onClick={() => onApply(DEFAULT_CODE)}
  //         className={`min-h-11 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
  //           dark
  //             ? "bg-gold text-navy hover:bg-gold/90"
  //             : "bg-navy text-beige hover:opacity-90"
  //         }`}
  //       >
  //         Apply {DEFAULT_CODE}
  //       </button>
  //     </div>
  //   </motion.div>
  // );
});
