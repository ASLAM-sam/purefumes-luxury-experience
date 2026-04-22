import { memo } from "react";
import { Flame } from "lucide-react";

export const StickyOfferBar = memo(function StickyOfferBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-navy">
      <div className="flex items-center justify-center gap-2 py-2 text-[0.7rem] uppercase tracking-[0.3em] text-gold">
        <Flame className="w-3.5 h-3.5" />
        <span>Flat 50% Off on Selected Perfumes · Free Shipping over ₹999</span>
      </div>
    </div>
  );
});
