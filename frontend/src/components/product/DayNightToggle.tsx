import { memo } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

type Mode = "Day" | "Night";

export const DayNightToggle = memo(function DayNightToggle({
  value,
  onChange,
  available,
}: {
  value: Mode;
  onChange: (m: Mode) => void;
  available: "Day" | "Night" | "Day & Night";
}) {
  const dayOk = available !== "Night";
  const nightOk = available !== "Day";

  return (
    <div className="inline-flex items-center rounded-full bg-beige p-1 shadow-soft relative">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="absolute top-1 bottom-1 rounded-full bg-navy shadow-luxe"
        style={{ left: value === "Day" ? 4 : "calc(50% + 0px)", width: "calc(50% - 4px)" }}
      />
      {(["Day", "Night"] as const).map((m) => {
        const enabled = m === "Day" ? dayOk : nightOk;
        const active = value === m;
        const Icon = m === "Day" ? Sun : Moon;
        return (
          <button
            key={m}
            disabled={!enabled}
            onClick={() => enabled && onChange(m)}
            className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-40 ${
              active ? "text-beige" : "text-navy/70 hover:text-navy"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {m}
          </button>
        );
      })}
    </div>
  );
});
