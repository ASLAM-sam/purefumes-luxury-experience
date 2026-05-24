import { memo } from "react";
import type { Size } from "@/data/products";
import { formatINR } from "@/lib/money";

type Props = { sizes: Size[]; selected: Size; onSelect: (s: Size) => void };

export const SizeSelector = memo(function SizeSelector({ sizes, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 min-[420px]:gap-3 lg:grid-cols-3">
      {sizes.map((s) => {
        const active = s.size === selected.size;
        return (
          <button
            key={s.size}
            type="button"
            onClick={() => onSelect(s)}
            aria-pressed={active}
            className={`min-w-0 rounded-2xl border p-3 text-left transition-all min-[420px]:p-4 ${
              active
                ? "border-navy bg-navy text-beige shadow-luxe"
                : "border-border/70 bg-card text-navy/75 hover:-translate-y-0.5 hover:border-navy/40 hover:bg-beige/30"
            }`}
          >
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="break-words font-display text-lg leading-tight min-[420px]:text-xl sm:text-2xl">{s.size}</p>
                <p className={`mt-1 text-[0.65rem] uppercase tracking-[0.12em] min-[420px]:text-xs min-[420px]:tracking-[0.2em] ${active ? "text-beige/70" : "text-navy/45"}`}>
                  {formatINR(s.price)}
                </p>
              </div>
              {active ? (
                <span className="rounded-full bg-beige/10 px-2 py-1 text-[0.52rem] uppercase tracking-[0.12em] text-beige/80 min-[420px]:px-2.5 min-[420px]:text-[0.58rem] min-[420px]:tracking-[0.18em]">
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
