import { memo } from "react";

export const StockBar = memo(function StockBar({ stock }: { stock: number }) {
  const max = 50;
  const pct = Math.min(100, (stock / max) * 100);
  const low = stock <= 10;
  const out = stock <= 0;

  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="uppercase tracking-[0.2em] text-navy/70">Stock</span>
        <span className={`tabular-nums font-medium ${out ? "text-red-600" : low ? "text-amber-600" : "text-green-700"}`}>
          {out ? "Out of stock" : low ? `Only ${stock} left` : `${stock} in stock`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-beige overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: out ? "#dc2626" : low ? "#d97706" : "linear-gradient(90deg,#7BC47F,#4A9D5A)",
          }}
        />
      </div>
    </div>
  );
});
