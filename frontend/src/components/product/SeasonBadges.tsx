import { memo } from "react";
import type { Season } from "@/data/products";

const meta: Record<Season, { color: string; label: string }> = {
  Spring: { color: "#7BC47F", label: "Spring" },
  Summer: { color: "#F4B53D", label: "Summer" },
  Autumn: { color: "#C97447", label: "Autumn" },
  Winter: { color: "#5BAFE8", label: "Winter" },
};

export const SeasonBadges = memo(function SeasonBadges({ seasons }: { seasons: Season[] }) {
  const all: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((s) => {
        const active = seasons.includes(s);
        const m = meta[s];
        return (
          <span
            key={s}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.2em] rounded-full transition-all ${
              active ? "text-white shadow-soft" : "bg-beige/60 text-navy/40"
            }`}
            style={active ? { backgroundColor: m.color } : undefined}
          >
            {m.label}
          </span>
        );
      })}
    </div>
  );
});
