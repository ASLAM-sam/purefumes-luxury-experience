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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cols.map(({ key, label, Icon, color }) => (
        <div key={key} className="rounded-2xl bg-beige/50 p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: color + "33" }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-navy/70 font-medium">
              {label}
            </p>
          </div>
          {data[key].length > 0 ? (
            <ul className="space-y-1.5">
              {data[key].map((n) => (
                <li key={n} className="text-sm text-navy/85">
                  {n}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy/45">Not listed yet</p>
          )}
        </div>
      ))}
    </div>
  );
});
