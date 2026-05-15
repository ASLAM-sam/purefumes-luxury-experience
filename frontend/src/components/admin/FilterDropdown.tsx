import { memo } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export const FilterDropdown = memo(function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: Props) {
  return (
    <label className="flex min-w-[10rem] flex-col gap-2">
      <span className="text-[0.65rem] uppercase tracking-[0.28em] text-navy/45">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-white/70 bg-white/80 px-4 text-sm text-navy shadow-[0_14px_32px_rgba(7,31,63,0.08)] outline-none transition focus:border-gold/70"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
});
