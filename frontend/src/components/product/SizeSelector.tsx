import { memo } from "react";
import type { Size } from "@/data/products";

type Props = { sizes: Size[]; selected: Size; onSelect: (s: Size) => void };

export const SizeSelector = memo(function SizeSelector({ sizes, selected, onSelect }: Props) {
  const formatPrice = (price: number) => `Rs. ${Number(price || 0).toLocaleString("en-IN")}`;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {sizes.map((s) => {
        const active = s.size === selected.size;
        return (
          <button
            key={s.size}
            type="button"
            onClick={() => onSelect(s)}
            aria-pressed={active}
            className={`rounded-2xl border p-4 text-left transition-all ${
              active
                ? "border-navy bg-navy text-beige shadow-luxe"
                : "border-border/70 bg-card text-navy/75 hover:-translate-y-0.5 hover:border-navy/40 hover:bg-beige/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl sm:text-2xl">{s.size}</p>
                <p className={`mt-1 text-xs uppercase tracking-[0.2em] ${active ? "text-beige/70" : "text-navy/45"}`}>
                  {formatPrice(s.price)}
                </p>
              </div>
              {active ? (
                <span className="rounded-full bg-beige/10 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-beige/80">
                  Selected
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
});
