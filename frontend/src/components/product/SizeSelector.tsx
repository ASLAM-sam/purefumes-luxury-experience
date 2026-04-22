import { memo } from "react";
import type { Size } from "@/data/products";

type Props = { sizes: Size[]; selected: Size; onSelect: (s: Size) => void };

export const SizeSelector = memo(function SizeSelector({ sizes, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {sizes.map((s) => {
        const active = s.size === selected.size;
        return (
          <button
            key={s.size}
            onClick={() => onSelect(s)}
            className={`p-4 rounded-xl border text-center transition-all ${
              active
                ? "border-navy bg-navy text-beige shadow-luxe"
                : "border-border bg-card text-navy/70 hover:border-navy/50 hover:bg-beige/40"
            }`}
          >
            <p className="font-display text-2xl">{s.size}</p>
            <p className="text-xs mt-1">₹{s.price}</p>
          </button>
        );
      })}
    </div>
  );
});
