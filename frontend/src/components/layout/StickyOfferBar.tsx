import { memo } from "react";
import { Flame } from "lucide-react";

export const StickyOfferBar = memo(function StickyOfferBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] bg-[#041528] text-gold">
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-center text-[0.64rem] uppercase tracking-[0.32em]">
        <Flame className="h-3.5 w-3.5" />
        <span>Flat 50% Off on Selected Perfumes - Free Shipping over Rs. 999</span>
      </div>
    </div>
  );
});
