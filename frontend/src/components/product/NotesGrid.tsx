import { memo } from "react";
import { Sparkles, Flower2, TreePine } from "lucide-react";

type Props = { top: string[]; middle: string[]; base: string[] };

const cols = [
  { key: "top" as const, label: "Top Notes", Icon: Sparkles, color: "#F4C53D" },
  { key: "middle" as const, label: "Heart Notes", Icon: Flower2, color: "#E89BB1" },
  { key: "base" as const, label: "Base Notes", Icon: TreePine, color: "#8B5A2B" },
];

export const NotesGrid = memo(function NotesGrid({ top, middle, base }: Props) {
  const data = { top, middle, base };
  return (
    <div className="grid grid-cols-3 gap-4">
      {cols.map(({ key, label, Icon, color }) => (
        <div key={key} className="rounded-2xl bg-beige/50 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: color + "33" }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-navy/70 font-medium">{label}</p>
          </div>
          <ul className="space-y-1.5">
            {data[key].map((n) => (
              <li key={n} className="text-sm text-navy/85">{n}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
});
